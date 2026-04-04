import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getModelToken } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { User, UserRole } from '../users/entities/user.entity';
import { Course } from '../courses/schemas/course.schema';
import { Enrollment } from '../enrollments/schemas/enrollment.schema';
import { Transaction, TransactionStatus } from '../payments/entities/transaction.entity';
import { LiveClass, LiveClassStatus } from '../live-classes/schemas/live-class.schema';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  const mockUserRepository = {
    count: jest.fn().mockResolvedValue(100),
    find: jest.fn().mockResolvedValue([{ id: 'u1' }]),
  };

  const mockCourseModel = {
    countDocuments: jest.fn().mockResolvedValue(10),
  };

  const mockEnrollmentModel = {
    countDocuments: jest.fn().mockResolvedValue(50),
    find: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ student_id: 'u1' }]),
      }),
    }),
  };

  const mockTransactionRepository = {
    find: jest.fn().mockResolvedValue([{ userId: 'u1', amount: 10000 }]),
  };

  const mockLiveClassModel = {
    countDocuments: jest.fn().mockResolvedValue(5),
    find: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ attended_students: ['u1'] }]),
      }),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getModelToken(Course.name),
          useValue: mockCourseModel,
        },
        {
          provide: getModelToken(Enrollment.name),
          useValue: mockEnrollmentModel,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getModelToken(LiveClass.name),
          useValue: mockLiveClassModel,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOverview', () => {
    it('should return overview data in correct shape', async () => {
      const result = await service.getOverview();
      
      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('catalog');
      expect(result).toHaveProperty('learning');
      expect(result).toHaveProperty('revenue');
      expect(result).toHaveProperty('live_classes');
      
      expect(result.users.total_users).toBe(100);
      expect(result.catalog.total_courses).toBe(10);
      expect(result.revenue.revenue_all_time).toBe(100); // 10000 / 100
    });
  });
});
