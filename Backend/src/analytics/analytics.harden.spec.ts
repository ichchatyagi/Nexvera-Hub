import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getModelToken } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { User, UserRole } from '../users/entities/user.entity';
import { Course } from '../courses/schemas/course.schema';
import { Enrollment } from '../enrollments/schemas/enrollment.schema';
import { Transaction, TransactionStatus } from '../payments/entities/transaction.entity';
import { LiveClass, LiveClassStatus } from '../live-classes/schemas/live-class.schema';
import { CacheService } from '../cache/cache.service';

describe('AnalyticsService Hardening', () => {
  let service: AnalyticsService;
  let mockUserRepository: any;
  let mockCourseModel: any;
  let mockEnrollmentModel: any;
  let mockTransactionRepository: any;
  let mockLiveClassModel: any;

  beforeEach(async () => {
    mockUserRepository = {
      count: jest.fn().mockResolvedValue(0),
      find: jest.fn().mockResolvedValue([]),
    };
    mockCourseModel = {
      countDocuments: jest.fn().mockResolvedValue(0),
    };
    mockEnrollmentModel = {
      countDocuments: jest.fn().mockResolvedValue(0),
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      }),
    };
    mockTransactionRepository = {
      find: jest.fn().mockResolvedValue([]),
    };
    mockLiveClassModel = {
      countDocuments: jest.fn().mockResolvedValue(0),
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      }),
    };

    const mockCacheService = {
      getOrSetJson: jest.fn().mockImplementation((ns, key, ttl, loader) => loader()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getModelToken(Course.name), useValue: mockCourseModel },
        { provide: getModelToken(Enrollment.name), useValue: mockEnrollmentModel },
        { provide: getRepositoryToken(Transaction), useValue: mockTransactionRepository },
        { provide: getModelToken(LiveClass.name), useValue: mockLiveClassModel },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  describe('Revenue Correctness', () => {
    it('returns 0 and empty breakdown when no transactions', async () => {
      const result = await service.getOverview();
      expect(result.success).toBe(true);
      expect(result.data.revenue.revenue_all_time).toBe(0);
      expect(result.data.revenue.currency_breakdown).toEqual({});
    });

    it('correctly aggregates multiple currencies in major units', async () => {
      mockTransactionRepository.find.mockResolvedValue([
        { amount: 100.50, currency: 'INR' },
        { amount: 50.00, currency: 'USD' },
        { amount: 200.00, currency: 'INR' },
      ]);

      const result = await service.getOverview();
      expect(result.data.revenue.revenue_all_time).toBe(350.50);
      expect(result.data.revenue.currency_breakdown).toEqual({
        INR: 300.50,
        USD: 50.00,
      });
    });
  });

  describe('Active Students (30d) De-duplication', () => {
    it('counts unique students across all sources', async () => {
        // Source 1: Enrollments (User A)
        mockEnrollmentModel.find.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([{ student_id: 'user-A' }]),
            }),
        });
        // Source 2: Transactions (User A + User B)
        mockTransactionRepository.find.mockResolvedValue([
            { userId: 'user-A' },
            { userId: 'user-B' }
        ]);
        // Source 3: Class Attendance (User B + User C)
        mockLiveClassModel.find.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([{ attended_students: ['user-B', 'user-C'] }]),
            }),
        });
        // Source 4: New Registrations (User C)
        mockUserRepository.find.mockResolvedValue([{ id: 'user-C' }]);

        const result = await service.getOverview();
        // Unique users: A, B, C
        expect(result.data.users.active_students_30d).toBe(3);
    });
  });

  describe('Failure Safety', () => {
    it('returns success:false if a query crashes', async () => {
      mockUserRepository.count.mockRejectedValue(new Error('Postgres is down'));
      
      const result = await service.getOverview();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to aggregate');
      expect(result.message).toBe('Postgres is down');
    });
  });

  describe('Date Boundaries (UTC)', () => {
      it('uses UTC start and end of today', async () => {
          const spy = jest.spyOn(mockLiveClassModel, 'countDocuments');
          await service.getOverview();
          
          const scheduledTodayCall = spy.mock.calls.find(call => 
              call[0].status === LiveClassStatus.SCHEDULED && call[0].scheduled_start
          );
          
          const { $gte, $lte } = scheduledTodayCall[0].scheduled_start;
          expect($gte.getUTCHours()).toBe(0);
          expect($gte.getUTCMinutes()).toBe(0);
          expect($lte.getUTCHours()).toBe(23);
          expect($lte.getUTCMinutes()).toBe(59);
      });
  });
});
