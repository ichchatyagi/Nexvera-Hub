import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from './entities/transaction.entity';
import { TeacherPayout, PayoutStatus } from './entities/teacher-payout.entity';
import { AppConfigService } from '../app-config/app-config.service';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { CoursesService } from '../courses/courses.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';

@Injectable()
export class PaymentsService {
  private razorpay: any;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(TeacherPayout)
    private teacherPayoutRepository: Repository<TeacherPayout>,
    private configService: AppConfigService,
    private coursesService: CoursesService,
    private enrollmentsService: EnrollmentsService,
  ) {
    if (
      !this.configService.razorpayKeyId ||
      !this.configService.razorpayKeySecret
    ) {
      throw new Error('Razorpay configuration is missing');
    }

    this.razorpay = new Razorpay({
      key_id: this.configService.razorpayKeyId,
      key_secret: this.configService.razorpayKeySecret,
    });
  }

  async createOrder(courseId: string, userId: string) {
    const courseResponse = await this.coursesService.findById(courseId);
    const course = courseResponse.data;

    if (course.status !== 'published') {
      throw new BadRequestException('Course is not available for purchase');
    }

    if (course.pricing.type === 'free') {
      throw new BadRequestException('Course is free, use enrollment endpoint');
    }

    const amount = Math.round(course.pricing.price * 100); // in paise
    const currency = course.pricing.currency || 'INR';

    try {
      const order = await this.razorpay.orders.create({
        amount,
        currency,
        receipt: `receipt_${Date.now()}_${userId.substring(0, 8)}`,
        notes: {
          user_id: userId,
          course_id: courseId,
        },
      });

      const transaction = this.transactionRepository.create({
        userId,
        courseId,
        amount: course.pricing.price,
        currency,
        status: TransactionStatus.PENDING,
        type: TransactionType.COURSE_PURCHASE,
        razorpayOrderId: order.id,
        metadata: {
          razorpay_order: order,
        },
      });

      await this.transactionRepository.save(transaction);

      return {
        success: true,
        data: {
          orderId: order.id,
          amount,
          currency,
          keyId: this.configService.razorpayKeyId,
          course: {
            id: course._id,
            title: course.title,
            thumbnail: course.thumbnail_url,
          },
        },
      };
    } catch (error) {
      this.logger.error('Failed to create Razorpay order', error.stack);
      throw new InternalServerErrorException('Failed to initiate payment');
    }
  }

  async handleWebhook(body: any, signature: string) {
    const secret = this.configService.razorpayWebhookSecret;

    // Verify signature
    // Razorpay webhook signature verification usually compares 
    // the hex digest of (rawBody + secret) with signature.
    // Wait, the official recommendation is to use Razorpay.validateWebhookSignature
    
    const isValid = Razorpay.validateWebhookSignature(
      JSON.stringify(body),
      signature,
      secret
    );

    if (!isValid) {
      this.logger.warn('Invalid Razorpay signature received');
      throw new BadRequestException('Invalid signature');
    }

    const event = body.event;
    this.logger.log(`Received Razorpay webhook: ${event}`);

    const payload = body.payload;
    
    if (event === 'payment.captured') {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;

      const transaction = await this.transactionRepository.findOne({
        where: { razorpayOrderId: orderId },
      });

      if (!transaction) {
        this.logger.error(`Transaction not found for order ${orderId}`);
        return { received: true };
      }

      if (transaction.status === TransactionStatus.COMPLETED) {
        this.logger.log(`Transaction ${transaction.id} already completed`);
        return { received: true };
      }

      // Update transaction
      transaction.status = TransactionStatus.COMPLETED;
      transaction.razorpayPaymentId = payment.id;
      transaction.razorpaySignature = signature;
      await this.transactionRepository.save(transaction);

      // Create enrollment
      try {
        await this.enrollmentsService.enroll(
          transaction.courseId,
          transaction.userId,
          transaction.id,
        );
        await this.coursesService.incrementEnrollments(transaction.courseId);
        
        // Record teacher earnings
        await this.recordTeacherEarnings(transaction);
        
        this.logger.log(`User ${transaction.userId} successfully enrolled in ${transaction.courseId}`);
      } catch (error) {
        this.logger.error(`Failed to process post-payment tasks for transaction ${transaction.id}`, error.stack);
      }
    } else if (event === 'payment.failed') {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;

      const transaction = await this.transactionRepository.findOne({
        where: { razorpayOrderId: orderId },
      });

      if (transaction && transaction.status === TransactionStatus.PENDING) {
        transaction.status = TransactionStatus.FAILED;
        transaction.razorpayPaymentId = payment.id;
        await this.transactionRepository.save(transaction);
        this.logger.log(`Payment failed for transaction ${transaction.id}`);
      }
    }

    return { received: true };
  }

  private async recordTeacherEarnings(transaction: Transaction) {
    try {
      const courseResponse = await this.coursesService.findById(transaction.courseId);
      const course = courseResponse.data;
      const teacherId = course.teacher_id;

      // Compute earnings (70% teacher, 30% platform)
      const teacherShare = Number(transaction.amount) * 0.7;

      const payout = this.teacherPayoutRepository.create({
        teacherId,
        amount: teacherShare,
        currency: transaction.currency,
        status: PayoutStatus.PENDING,
      });

      await this.teacherPayoutRepository.save(payout);
      this.logger.log(`Recorded earnings for teacher ${teacherId}: ${teacherShare} ${transaction.currency}`);
    } catch (error) {
      this.logger.error('Failed to record teacher earnings', error.stack);
    }
  }

  async getMyEarnings(teacherId: string) {
    const payouts = await this.teacherPayoutRepository.find({
      where: { teacherId },
      order: { createdAt: 'DESC' },
    });

    // Total earned could be pending + completed, but typically current "balance" is what they want
    const totalEarned = payouts
      .filter(p => p.status === PayoutStatus.COMPLETED || p.status === PayoutStatus.PENDING)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      success: true,
      data: {
        totalEarned,
        currency: 'INR',
        history: payouts,
      },
    };
  }
}
