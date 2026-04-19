import {
  Injectable,
  OnModuleInit,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { AppConfigService } from '../../app-config/app-config.service';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';
import { Course, CourseDocument } from '../../courses/schemas/course.schema';
import { EnrollmentsService } from '../../enrollments/enrollments.service';
import { VerifyRazorpayDto, CreateOrderDto } from '../dto/razorpay.dto';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/schemas/notification.schema';

@Injectable()
export class PaymentsService implements OnModuleInit {
  private razorpay: any;

  constructor(
    private readonly configService: AppConfigService,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  onModuleInit() {
    this.razorpay = new Razorpay({
      key_id: this.configService.razorpayKeyId,
      key_secret: this.configService.razorpayKeySecret,
    });
  }

  /**
   * Create a Razorpay order for a student to purchase a course.
   */
  async createCourseOrder(userId: string, dto: CreateOrderDto) {
    const courseId = dto.courseId;
    if (!Types.ObjectId.isValid(courseId)) {
      throw new NotFoundException('Invalid Course ID format');
    }

    const course = await this.courseModel.findById(courseId);
    if (!course || course.status !== 'published') {
      throw new NotFoundException(
        'Course not found or not available for purchase',
      );
    }

    // Check if player is already actively enrolled
    const isAlreadyEnrolled = await this.enrollmentsService.hasAccess(
      userId,
      courseId,
      dto.product_type as any || course.product_type,
      dto.subjectId,
    );

    if (isAlreadyEnrolled) {
      throw new BadRequestException('You are already enrolled in this course/subject');
    }

    let price = course.pricing?.price || 0;
    let currency = course.pricing?.currency || 'INR';

    if (course.product_type === 'tuition' || dto.product_type === 'tuition') {
      if (!course.tuition_meta)
        throw new BadRequestException('Invalid tuition configuration');
      if (course.product_type !== 'tuition')
        throw new BadRequestException('Mismatched product type');

      const isBundle = dto.billing_mode === 'bundle';
      currency = course.tuition_meta.pricing?.currency || 'INR';

      if (dto.access_scope === 'class') {
        const pricing = course.tuition_meta.pricing;
        if (isBundle) {
          if (!pricing?.bundle_enabled)
            throw new BadRequestException('Class bundle purchase not enabled');
          price = pricing.bundle_price || 0;
        } else {
          if (!pricing?.monthly_enabled)
            throw new BadRequestException('Class monthly purchase not enabled');
          price = pricing.monthly_price || 0;
        }
      } else if (dto.access_scope === 'subject') {
        if (!dto.subjectId) throw new BadRequestException('Missing subject ID');
        const subject = course.tuition_meta.subjects.find(
          (s) => s.subject_id.toString() === dto.subjectId,
        );
        if (!subject || !subject.pricing)
          throw new BadRequestException('Invalid tuition subject or pricing');

        if (isBundle) {
          if (!subject.pricing.bundle_enabled)
            throw new BadRequestException(
              'Subject bundle purchase not enabled',
            );
          price = subject.pricing.bundle_price || 0;
        } else {
          if (!subject.pricing.monthly_enabled)
            throw new BadRequestException(
              'Subject monthly purchase not enabled',
            );
          price = subject.pricing.monthly_price || 0;
        }
      } else {
        throw new BadRequestException('Invalid access scope');
      }

      if (!price || price <= 0) {
        throw new BadRequestException(
          'Resolved tuition price cannot be zero or less',
        );
      }
    }

    const amountInMinorUnit = Math.round(price * 100);

    // Create Razorpay Order
    const order = await this.razorpay.orders.create({
      amount: amountInMinorUnit,
      currency: currency,
      receipt: `receipt_${Date.now()}_${userId.slice(0, 8)}`,
      notes: {
        userId,
        courseId,
        type: 'course_purchase',
      },
    });

    // Save pending transaction with major units (e.g. 999.00)
    const transaction = this.transactionRepository.create({
      userId,
      courseId,
      amount: price,
      currency: currency,
      status: TransactionStatus.PENDING,
      razorpayOrderId: order.id,
      metadata: {
        type: 'course_purchase',
        courseTitle: course.title,
        gateway: 'razorpay',
        orderId: order.id,
        user_id: userId,
        product_type: dto.product_type || course.product_type,
        billing_mode: dto.billing_mode,
        access_scope: dto.access_scope,
        subjectId: dto.subjectId,
        orig_price: price, // major unit
        orig_currency: currency,
      },
    });

    await this.transactionRepository.save(transaction);

    return {
      success: true,
      data: {
        keyId: this.configService.razorpayKeyId,
        orderId: order.id,
        amount: amountInMinorUnit,
        currency,
        course: {
          id: course._id,
          title: course.title,
          slug: course.slug,
        },
      },
    };
  }

  /**
   * Verify Razorpay payment signature and confirm enrollment.
   */
  async verifyAndConfirmPayment(userId: string, dto: VerifyRazorpayDto) {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
    } = dto;

    // Verify signature
    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', this.configService.razorpayKeySecret)
      .update(text)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new ForbiddenException('Invalid Razorpay signature');
    }

    // Find transaction
    let transaction = await this.transactionRepository.findOne({
      where: {
        razorpayOrderId: razorpay_order_id,
        userId,
        courseId: courseId,
      },
    });

    // Fallback for legacy
    if (!transaction) {
      transaction = await this.transactionRepository.findOne({
        where: {
          stripePaymentId: razorpay_order_id,
          userId,
          courseId: courseId,
        },
      });
    }

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === TransactionStatus.COMPLETED) {
      return {
        success: true,
        data: { enrolled: true, alreadyCompleted: true },
      };
    }

    // Update transaction - preserve all metadata, add confirmation details
    transaction.status = TransactionStatus.COMPLETED;
    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.razorpaySignature = razorpay_signature;
    transaction.metadata = {
      ...(transaction.metadata || {}),
      gateway: 'razorpay',
      razorpayPaymentId: razorpay_payment_id,
      verifiedAt: new Date().toISOString(),
    };

    await this.transactionRepository.save(transaction);

    // Create enrollment
    await this.enrollmentsService.enroll(
      courseId,
      userId,
      transaction.metadata,
    );

    // Send notification
    try {
      const metadata = transaction.metadata || {};
      await this.notificationsService.createNotification({
        user_id: userId,
        type: NotificationType.PAYMENT_CONFIRMED,
        title: 'Payment confirmed',
        body: metadata.courseTitle
          ? `Your payment for "${metadata.courseTitle}" was confirmed.`
          : `Your payment was confirmed.`,
        data: {
          courseId,
          razorpay_order_id,
          razorpay_payment_id,
          gateway: 'razorpay',
          product_type: metadata.product_type,
          access_scope: metadata.access_scope,
          subjectId: metadata.subjectId,
        },
      });
    } catch (err) {
      console.error('Failed to send payment confirmation notification:', err);
    }

    return {
      success: true,
      data: {
        enrolled: true,
      },
    };
  }
}
