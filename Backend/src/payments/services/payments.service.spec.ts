import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getModelToken } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';
import { Course } from '../../courses/schemas/course.schema';
import { EnrollmentsService } from '../../enrollments/enrollments.service';
import { AppConfigService } from '../../app-config/app-config.service';
import { Types } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

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
};

describe('PaymentsService Tuition Logic', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: AppConfigService, useValue: mockConfigService },
        { provide: getRepositoryToken(Transaction), useValue: mockTransactionRepo },
        { provide: getModelToken(Course.name), useValue: mockCourseModel },
        { provide: EnrollmentsService, useValue: mockEnrollmentsService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    (service as any).razorpay = {
      orders: { create: jest.fn().mockResolvedValue({ id: 'order_123' }) }
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
        tuition_meta: { pricing: { monthly_enabled: false, monthly_price: 1000 } }
      });
      const dto = { courseId, product_type: 'tuition', access_scope: 'class', billing_mode: 'monthly' };
      await expect(service.createCourseOrder('u1', dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if class bundle requested but not enabled', async () => {
      const courseId = new Types.ObjectId().toString();
      mockCourseModel.findById.mockResolvedValue({
        status: 'published',
        product_type: 'tuition',
        tuition_meta: { pricing: { bundle_enabled: false, bundle_price: 5000 } }
      });
      const dto = { courseId, product_type: 'tuition', access_scope: 'class', billing_mode: 'bundle' };
      await expect(service.createCourseOrder('u1', dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if subject monthly requested but not enabled', async () => {
      const courseId = new Types.ObjectId().toString();
      const subjectId = new Types.ObjectId().toString();
      mockCourseModel.findById.mockResolvedValue({
        status: 'published',
        product_type: 'tuition',
        tuition_meta: {
          subjects: [{ subject_id: subjectId, pricing: { monthly_enabled: false, monthly_price: 500 } }]
        }
      });
      const dto = { courseId, product_type: 'tuition', access_scope: 'subject', billing_mode: 'monthly', subjectId };
      await expect(service.createCourseOrder('u1', dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if subject bundle requested but not enabled', async () => {
      const courseId = new Types.ObjectId().toString();
      const subjectId = new Types.ObjectId().toString();
      mockCourseModel.findById.mockResolvedValue({
        status: 'published',
        product_type: 'tuition',
        tuition_meta: {
          subjects: [{ subject_id: subjectId, pricing: { bundle_enabled: false, bundle_price: 5000 } }]
        }
      });
      const dto = { courseId, product_type: 'tuition', access_scope: 'subject', billing_mode: 'bundle', subjectId };
      await expect(service.createCourseOrder('u1', dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if resolved tuition price is zero or missing', async () => {
      const courseId = new Types.ObjectId().toString();
      mockCourseModel.findById.mockResolvedValue({
        status: 'published',
        product_type: 'tuition',
        tuition_meta: { pricing: { monthly_enabled: true, monthly_price: 0 } }
      });
      const dto = { courseId, product_type: 'tuition', access_scope: 'class', billing_mode: 'monthly' };
      await expect(service.createCourseOrder('u1', dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyAndConfirmPayment Tuition Enrollments', () => {
    
    // Simulate Razorpay signature successfully
    const setupVerifyMock = (metadata: any) => {
       const razorpay_order_id = 'order_valid';
       const razorpay_payment_id = 'pay_valid';
       const text = razorpay_order_id + '|' + razorpay_payment_id;
       const razorpay_signature = crypto.createHmac('sha256', mockConfigService.razorpayKeySecret).update(text).digest('hex');

       const transaction = {
         id: 'trans_1',
         status: TransactionStatus.PENDING,
         metadata
       };
       
       mockTransactionRepo.findOne.mockResolvedValue(transaction);
       return { razorpay_order_id, razorpay_payment_id, razorpay_signature };
    };

    it('should enroll subject monthly correctly mapping metadata', async () => {
      const courseId = new Types.ObjectId().toString();
      const subjectId = new Types.ObjectId().toString();
      const dto = setupVerifyMock({ product_type: 'tuition', access_scope: 'subject', billing_mode: 'monthly', subjectId });
      
      await service.verifyAndConfirmPayment('u1', { ...dto, courseId });
      
      expect(mockTransactionRepo.save).toHaveBeenCalled();
      expect(mockEnrollmentsService.enroll).toHaveBeenCalledWith(courseId, 'u1', expect.objectContaining({
         product_type: 'tuition', access_scope: 'subject', billing_mode: 'monthly', subjectId
      }));
    });

    it('should enroll class monthly correctly', async () => {
      const courseId = new Types.ObjectId().toString();
      const dto = setupVerifyMock({ product_type: 'tuition', access_scope: 'class', billing_mode: 'monthly' });
      
      await service.verifyAndConfirmPayment('u1', { ...dto, courseId });
      
      expect(mockEnrollmentsService.enroll).toHaveBeenCalledWith(courseId, 'u1', expect.objectContaining({
         product_type: 'tuition', access_scope: 'class', billing_mode: 'monthly'
      }));
    });

    it('should enroll subject bundle correctly', async () => {
      const courseId = new Types.ObjectId().toString();
      const subjectId = new Types.ObjectId().toString();
      const dto = setupVerifyMock({ product_type: 'tuition', access_scope: 'subject', billing_mode: 'bundle', subjectId });
      
      await service.verifyAndConfirmPayment('u1', { ...dto, courseId });
      
      expect(mockEnrollmentsService.enroll).toHaveBeenCalledWith(courseId, 'u1', expect.objectContaining({
         product_type: 'tuition', access_scope: 'subject', billing_mode: 'bundle', subjectId
      }));
    });

    it('should enroll class bundle correctly', async () => {
      const courseId = new Types.ObjectId().toString();
      const dto = setupVerifyMock({ product_type: 'tuition', access_scope: 'class', billing_mode: 'bundle' });
      
      await service.verifyAndConfirmPayment('u1', { ...dto, courseId });
      
      expect(mockEnrollmentsService.enroll).toHaveBeenCalledWith(courseId, 'u1', expect.objectContaining({
         product_type: 'tuition', access_scope: 'class', billing_mode: 'bundle'
      }));
    });
  });
});
