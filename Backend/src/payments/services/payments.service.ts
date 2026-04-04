import { Injectable, OnModuleInit, NotFoundException, ForbiddenException } from '@nestjs/common';
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
import { VerifyRazorpayDto } from '../dto/razorpay.dto';

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
  async createCourseOrder(userId: string, courseId: string) {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new NotFoundException('Invalid Course ID format');
    }

    const course = await this.courseModel.findById(courseId);
    if (!course || course.status !== 'published') {
      throw new NotFoundException('Course not found or not available for purchase');
    }

    const price = course.pricing?.price || 0;
    const currency = course.pricing?.currency || 'INR';
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

    // Save pending transaction
    const transaction = this.transactionRepository.create({
      userId,
      courseId,
      amount: price,
      currency: currency,
      status: TransactionStatus.PENDING,
      razorpayOrderId: order.id,
      stripePaymentId: order.id, // Legacy compatibility
      metadata: { 
        type: 'course_purchase', 
        courseTitle: course.title,
        gateway: 'razorpay'
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = dto;

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
        courseId: courseId 
      },
    });

    // Fallback for legacy
    if (!transaction) {
      transaction = await this.transactionRepository.findOne({
        where: { 
          stripePaymentId: razorpay_order_id, 
          userId, 
          courseId: courseId 
        },
      });
    }

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === TransactionStatus.COMPLETED) {
        return { success: true, data: { enrolled: true, alreadyCompleted: true } };
    }

    // Update transaction
    transaction.status = TransactionStatus.COMPLETED;
    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.razorpaySignature = razorpay_signature;
    transaction.metadata = {
      ...transaction.metadata,
      gateway: 'razorpay',
      razorpayPaymentId: razorpay_payment_id,
    };

    await this.transactionRepository.save(transaction);

    // Create enrollment
    await this.enrollmentsService.enroll(courseId, userId);

    return {
      success: true,
      data: {
        enrolled: true,
      },
    };
  }
}
