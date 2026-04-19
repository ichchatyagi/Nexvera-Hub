import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getModelToken } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';
import { Course } from '../../courses/schemas/course.schema';
import { EnrollmentsService } from '../../enrollments/enrollments.service';
import { AppConfigService } from '../../app-config/app-config.service';
import { Types } from 'mongoose';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/schemas/notification.schema';

const mockConfigService = {
  razorpayKeyId: 'test_key',
  razorpayKeySecret: 'test_secret',
};

const mockTransactionRepo = {
  create: jest.fn().mockImplementation((dto) => dto),
  save: jest.fn(),
  findOne: jest.fn(),
};

const mockCourseModel = {
  findById: jest.fn(),
};

const mockEnrollmentsService = {
  enroll: jest.fn(),
  hasAccess: jest.fn().mockResolvedValue(false),
};

const mockNotificationsService = {
  createNotification: jest.fn(),
};

describe('PaymentsService Tuition Logic', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: AppConfigService, useValue: mockConfigService },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepo,
        },
        { provide: getModelToken(Course.name), useValue: mockCourseModel },
        { provide: EnrollmentsService, useValue: mockEnrollmentsService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    (service as any).razorpay = {
      orders: { create: jest.fn().mockResolvedValue({ id: 'order_123' }) },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Invalid Pricing Combinations', () => {
    it('should throw BadRequestException if class monthly requested but not enabled', async () => {
      const courseId = new Types.ObjectId().toString();
      mockCourseModel.findById.mockResolvedValue({
        status: 'published',
        product_type: 'tuition',
        tuition_meta: {
          pricing: { monthly_enabled: false, monthly_price: 1000 },
        },
      });
      const dto = {
        courseId,
        product_type: 'tuition',
        access_scope: 'class',
        billing_mode: 'monthly',
      };
      await expect(service.createCourseOrder('u1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if class bundle requested but not enabled', async () => {
      const courseId = new Types.ObjectId().toString();
      mockCourseModel.findById.mockResolvedValue({
        status: 'published',
        product_type: 'tuition',
        tuition_meta: {
          pricing: { bundle_enabled: false, bundle_price: 5000 },
        },
      });
      const dto = {
        courseId,
        product_type: 'tuition',
        access_scope: 'class',
        billing_mode: 'bundle',
      };
      await expect(service.createCourseOrder('u1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if subject monthly requested but not enabled', async () => {
      const courseId = new Types.ObjectId().toString();
      const subjectId = new Types.ObjectId().toString();
      mockCourseModel.findById.mockResolvedValue({
        status: 'published',
        product_type: 'tuition',
        tuition_meta: {
          subjects: [
            {
              subject_id: subjectId,
              pricing: { monthly_enabled: false, monthly_price: 500 },
            },
          ],
        },
      });
      const dto = {
        courseId,
        product_type: 'tuition',
        access_scope: 'subject',
        billing_mode: 'monthly',
        subjectId,
      };
      await expect(service.createCourseOrder('u1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if subject bundle requested but not enabled', async () => {
      const courseId = new Types.ObjectId().toString();
      const subjectId = new Types.ObjectId().toString();
      mockCourseModel.findById.mockResolvedValue({
        status: 'published',
        product_type: 'tuition',
        tuition_meta: {
          subjects: [
            {
              subject_id: subjectId,
              pricing: { bundle_enabled: false, bundle_price: 5000 },
            },
          ],
        },
      });
      const dto = {
        courseId,
        product_type: 'tuition',
        access_scope: 'subject',
        billing_mode: 'bundle',
        subjectId,
      };
      await expect(service.createCourseOrder('u1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if resolved tuition price is zero or missing', async () => {
      const courseId = new Types.ObjectId().toString();
      mockCourseModel.findById.mockResolvedValue({
        status: 'published',
        product_type: 'tuition',
        tuition_meta: { pricing: { monthly_enabled: true, monthly_price: 0 } },
      });
      const dto = {
        courseId,
        product_type: 'tuition',
        access_scope: 'class',
        billing_mode: 'monthly',
      };
      await expect(service.createCourseOrder('u1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('verifyAndConfirmPayment Tuition Enrollments', () => {
    // Simulate Razorpay signature successfully
    const setupVerifyMock = (metadata: any) => {
      const razorpay_order_id = 'order_valid';
      const razorpay_payment_id = 'pay_valid';
      const text = razorpay_order_id + '|' + razorpay_payment_id;
      const razorpay_signature = crypto
        .createHmac('sha256', mockConfigService.razorpayKeySecret)
        .update(text)
        .digest('hex');

      const transaction = {
        id: 'trans_1',
        status: TransactionStatus.PENDING,
        metadata,
      };

      mockTransactionRepo.findOne.mockResolvedValue(transaction);
      return { razorpay_order_id, razorpay_payment_id, razorpay_signature };
    };

    it('should enroll subject monthly correctly mapping metadata and send notification', async () => {
      const courseId = new Types.ObjectId().toString();
      const subjectId = new Types.ObjectId().toString();
      const dto = setupVerifyMock({
        product_type: 'tuition',
        access_scope: 'subject',
        billing_mode: 'monthly',
        subjectId,
      });

      await service.verifyAndConfirmPayment('u1', { ...dto, courseId });

      expect(mockTransactionRepo.save).toHaveBeenCalled();
      expect(mockEnrollmentsService.enroll).toHaveBeenCalledWith(
        courseId,
        'u1',
        expect.objectContaining({
          product_type: 'tuition',
          access_scope: 'subject',
          billing_mode: 'monthly',
          subjectId,
        }),
      );
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.PAYMENT_CONFIRMED,
          user_id: 'u1',
        })
      );
    });

    it('should not send notification if transaction is already COMPLETED', async () => {
      const courseId = new Types.ObjectId().toString();
      const razorpay_order_id = 'order_valid';
      const razorpay_payment_id = 'pay_valid';
      const text = razorpay_order_id + '|' + razorpay_payment_id;
      const razorpay_signature = crypto
        .createHmac('sha256', mockConfigService.razorpayKeySecret)
        .update(text)
        .digest('hex');

      mockTransactionRepo.findOne.mockResolvedValueOnce({
        id: 'trans_1',
        status: TransactionStatus.COMPLETED,
        metadata: {},
      });

      const result = await service.verifyAndConfirmPayment('u1', {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        courseId
      });

      expect(result.data.alreadyCompleted).toBe(true);
      expect(mockNotificationsService.createNotification).not.toHaveBeenCalled();
    });

    it('should enroll class monthly correctly', async () => {
      const courseId = new Types.ObjectId().toString();
      const dto = setupVerifyMock({
        product_type: 'tuition',
        access_scope: 'class',
        billing_mode: 'monthly',
      });

      await service.verifyAndConfirmPayment('u1', { ...dto, courseId });

      expect(mockEnrollmentsService.enroll).toHaveBeenCalledWith(
        courseId,
        'u1',
        expect.objectContaining({
          product_type: 'tuition',
          access_scope: 'class',
          billing_mode: 'monthly',
        }),
      );
    });

    it('should enroll subject bundle correctly', async () => {
      const courseId = new Types.ObjectId().toString();
      const subjectId = new Types.ObjectId().toString();
      const dto = setupVerifyMock({
        product_type: 'tuition',
        access_scope: 'subject',
        billing_mode: 'bundle',
        subjectId,
      });

      await service.verifyAndConfirmPayment('u1', { ...dto, courseId });

      expect(mockEnrollmentsService.enroll).toHaveBeenCalledWith(
        courseId,
        'u1',
        expect.objectContaining({
          product_type: 'tuition',
          access_scope: 'subject',
          billing_mode: 'bundle',
          subjectId,
        }),
      );
    });

    it('should enroll class bundle correctly', async () => {
      const courseId = new Types.ObjectId().toString();
      const dto = setupVerifyMock({
        product_type: 'tuition',
        access_scope: 'class',
        billing_mode: 'bundle',
      });

      await service.verifyAndConfirmPayment('u1', { ...dto, courseId });

      expect(mockEnrollmentsService.enroll).toHaveBeenCalledWith(
        courseId,
        'u1',
        expect.objectContaining({
          product_type: 'tuition',
          access_scope: 'class',
          billing_mode: 'bundle',
        }),
      );
    });
  });

  describe('Amount Units and Precision', () => {
    it('should convert major units to minor units for Razorpay and store major units in DB', async () => {
      const courseId = new Types.ObjectId().toString();
      mockCourseModel.findById.mockResolvedValue({
        _id: courseId,
        status: 'published',
        title: 'High Precision Course',
        pricing: { price: 999.5, currency: 'INR' },
      });

      const result = await service.createCourseOrder('u1', { courseId });

      // Razorpay expects paisa (999.5 * 100 = 99950)
      expect((service as any).razorpay.orders.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 99950,
        }),
      );

      // DB should store rupees (999.5)
      expect(mockTransactionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 999.5,
        }),
      );

      expect(result.data.amount).toBe(99950);
    });
  });

  describe('Validation', () => {
    it('should throw BadRequestException if already enrolled', async () => {
      const courseId = new Types.ObjectId().toString();
      mockCourseModel.findById.mockResolvedValue({
        _id: courseId,
        status: 'published',
        product_type: 'course',
      });
      mockEnrollmentsService.hasAccess.mockResolvedValueOnce(true);

      await expect(
        service.createCourseOrder('u1', { courseId }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for invalid mongo courseId in createOrder', async () => {
      await expect(
        service.createCourseOrder('u1', { courseId: 'invalid-id' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
