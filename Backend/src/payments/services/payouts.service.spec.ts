import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getModelToken } from '@nestjs/mongoose';
import { PayoutsService } from './payouts.service';
import { TeacherPayout } from '../entities/payout.entity';
import { Course } from '../../courses/schemas/course.schema';
import { AppConfigService } from '../../app-config/app-config.service';

describe('PayoutsService', () => {
  let service: PayoutsService;
  let courseModel: any;

  beforeEach(async () => {
    courseModel = {
      find: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayoutsService,
        {
          provide: AppConfigService,
          useValue: { stripeSecretKey: 'sk_test_123' },
        },
        {
          provide: getRepositoryToken(TeacherPayout),
          useValue: { save: jest.fn() },
        },
        {
          provide: getModelToken(Course.name),
          useValue: courseModel,
        },
      ],
    }).compile();

    service = module.get<PayoutsService>(PayoutsService);
  });

  it('should compute zero earnings for a teacher with no assignments', async () => {
    courseModel.exec.mockResolvedValue([]);
    const result = await service.calculateEarnings('teacher-123');
    expect(result.totalPending).toBe(0);
    expect(result.breakdown).toHaveLength(0);
  });

  it('should compute earnings based on assigned Nexvera courses', async () => {
    courseModel.exec.mockResolvedValue([
      {
        _id: 'course-1',
        title: 'Cloud Architecture',
        stats: { enrollments: 10 },
        lead_instructor_id: 'teacher-123',
      },
    ]);

    const result = await service.calculateEarnings('teacher-123');
    expect(result.totalPending).toBe(150); // 10 * 15
    expect(result.breakdown[0].courseTitle).toBe('Cloud Architecture');
  });

  it('should link payouts to teaching assignments, not course ownership', async () => {
     // This test ensures the calculateEarnings uses the correctly assigned courses
     expect(courseModel.find).toHaveBeenCalledWith(expect.objectContaining({
         $or: [
             { lead_instructor_id: 'teacher-123' },
             { assigned_instructor_ids: 'teacher-123' }
         ]
     }));
  });
});
