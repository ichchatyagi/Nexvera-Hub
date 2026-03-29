import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { Transaction, TransactionStatus } from './entities/transaction.entity';
import { TeacherPayout } from './entities/teacher-payout.entity';
import { AppConfigService } from '../app-config/app-config.service';
import { CoursesService } from '../courses/courses.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { BadRequestException } from '@nestjs/common';
import Razorpay from 'razorpay';

const mockTransactionRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
};

const mockTeacherPayoutRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

const mockConfigService = {
  razorpayKeyId: 'test_key_id',
  razorpayKeySecret: 'test_key_secret',
  razorpayWebhookSecret: 'test_webhook_secret',
};

const mockCoursesService = {
  findById: jest.fn(),
  incrementEnrollments: jest.fn(),
};

const mockEnrollmentsService = {
  enroll: jest.fn(),
};

// Mock Razorpay instance
jest.mock('razorpay', () => {
  const mRazorpay = jest.fn().mockImplementation(() => {
    return {
      orders: {
        create: jest.fn().mockResolvedValue({ id: 'order_test_123' }),
      },
    };
  });
  (mRazorpay as any).validateWebhookSignature = jest.fn();
  return mRazorpay;
});

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(TeacherPayout),
          useValue: mockTeacherPayoutRepository,
        },
        {
          provide: AppConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CoursesService,
          useValue: mockCoursesService,
        },
        {
          provide: EnrollmentsService,
          useValue: mockEnrollmentsService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create a Razorpay order for a valid course', async () => {
      const courseId = 'course_123';
      const userId = 'user_abc';
      const mockCourse = {
        _id: courseId,
        status: 'published',
        pricing: { type: 'paid', price: 100, currency: 'INR' },
        title: 'Test Course',
        thumbnail_url: 'thumb.jpg',
      };

      mockCoursesService.findById.mockResolvedValue({ data: mockCourse });
      mockTransactionRepository.create.mockReturnValue({});

      const result = await service.createOrder(courseId, userId);

      expect(result.success).toBe(true);
      expect(result.data.orderId).toBe('order_test_123');
      expect(mockTransactionRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if course is not published', async () => {
      mockCoursesService.findById.mockResolvedValue({
        data: { status: 'draft' },
      });
      await expect(service.createOrder('1', '1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('handleWebhook', () => {
    it('should process payment.captured event', async () => {
      const payload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_123',
              order_id: 'order_123',
            },
          },
        },
      };

      (Razorpay.validateWebhookSignature as jest.Mock).mockReturnValue(true);

      mockTransactionRepository.findOne.mockResolvedValue({
        id: 'trans_123',
        courseId: 'course_123',
        userId: 'user_123',
        status: TransactionStatus.PENDING,
        amount: 100,
        currency: 'INR',
      });

      mockCoursesService.findById.mockResolvedValue({
        data: { teacher_id: 'teacher_123' },
      });

      const result = await service.handleWebhook(payload, 'sig_123');

      expect(result.received).toBe(true);
      expect(mockTransactionRepository.save).toHaveBeenCalled();
      expect(mockEnrollmentsService.enroll).toHaveBeenCalledWith(
        'course_123',
        'user_123',
        'trans_123',
      );
      expect(mockCoursesService.incrementEnrollments).toHaveBeenCalledWith(
        'course_123',
      );
      expect(mockTeacherPayoutRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid signature', async () => {
      (Razorpay.validateWebhookSignature as jest.Mock).mockReturnValue(false);
      await expect(service.handleWebhook({}, 'sig')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
