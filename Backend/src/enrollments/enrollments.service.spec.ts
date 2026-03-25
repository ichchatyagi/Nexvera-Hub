import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EnrollmentsService } from './enrollments.service';
import { Enrollment } from './schemas/enrollment.schema';
import { Types } from 'mongoose';
import { ConflictException } from '@nestjs/common';

const mockEnrollmentModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
};

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        {
          provide: getModelToken(Enrollment.name),
          useValue: mockEnrollmentModel,
        },
      ],
    }).compile();

    service = module.get<EnrollmentsService>(EnrollmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('enroll', () => {
    it('should enroll a student in a course', async () => {
      const courseId = new Types.ObjectId().toString();
      mockEnrollmentModel.findOne.mockResolvedValue(null);
      mockEnrollmentModel.create.mockResolvedValue({
        course_id: courseId,
        student_id: 's1',
      });

      const result = await service.enroll(courseId, 's1');

      expect(result.success).toBe(true);
      expect(mockEnrollmentModel.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if already enrolled', async () => {
      const courseId = new Types.ObjectId().toString();
      mockEnrollmentModel.findOne.mockResolvedValue({ _id: 'e1' });
      
      await expect(service.enroll(courseId, 's1')).rejects.toThrow(ConflictException);
    });
  });

  describe('updateProgress', () => {
    it('should update progress correctly', async () => {
      const courseId = new Types.ObjectId().toString();
      const mockSave = jest.fn();
      const mockEnrollment = {
        _id: 'e1',
        progress: {
          percentage: 0,
          completed_lessons: [],
        },
        save: mockSave,
      };

      const mockExec = jest.fn().mockResolvedValue(mockEnrollment);
      mockEnrollmentModel.findOne.mockReturnValue({ exec: mockExec });

      const result = await service.updateProgress(courseId, 's1', { percentage: 50 });

      expect(result.success).toBe(true);
      expect(mockEnrollment.progress.percentage).toBe(50);
      expect(mockSave).toHaveBeenCalled();
    });
  });
});
