import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EnrollmentsService } from './enrollments.service';
import { Enrollment } from './schemas/enrollment.schema';
import { Types } from 'mongoose';
import { ConflictException } from '@nestjs/common';

const mockEnrollmentModel: any = {
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
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

  describe('Tuition Extensions', () => {
    it('should assign explicit metadata tuples correctly injecting natively avoiding collisions', async () => {
       const courseId = new Types.ObjectId().toString();
       const subjectId = new Types.ObjectId().toString();
       mockEnrollmentModel.findOne.mockResolvedValue(null);
       mockEnrollmentModel.create.mockImplementation((obj) => obj);

       const result = await service.enroll(courseId, 's1', {
         product_type: 'tuition',
         access_scope: 'subject',
         billing_mode: 'monthly',
         subjectId
       });

       expect(result.success).toBe(true);
       expect(mockEnrollmentModel.create).toHaveBeenCalledWith(expect.objectContaining({
         product_type: 'tuition',
         tuition_class_id: new Types.ObjectId(courseId),
         tuition_subject_id: new Types.ObjectId(subjectId),
         billing_mode: 'monthly'
       }));
    });

    it('should accurately resolve hasTuitionAccess true for explicit subject queries actively natively', async () => {
      const classId = new Types.ObjectId().toString();
      const subjectId = new Types.ObjectId().toString();
      
      mockEnrollmentModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{
           product_type: 'tuition',
           billing_mode: 'bundle',
           access_scope: 'subject',
           tuition_subject_id: new Types.ObjectId(subjectId)
        }])
      });

      const access = await service.hasTuitionAccess('s1', classId, subjectId);
      expect(access).toBe(true);
    });

    it('should resolve hasTuitionAccess true executing class delegations accurately covering underlying layers automatically', async () => {
      const classId = new Types.ObjectId().toString();
      const subjectId = new Types.ObjectId().toString();
      
      mockEnrollmentModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{
           product_type: 'tuition',
           billing_mode: 'bundle',
           access_scope: 'class',
        }])
      });

      const access = await service.hasTuitionAccess('s1', classId, subjectId);
      expect(access).toBe(true);
    });

    it('should resolve hasTuitionAccess false for expired monthly boundaries cleanly separating dead states gracefully natively', async () => {
      const classId = new Types.ObjectId().toString();
      const subjectId = new Types.ObjectId().toString();
      
      mockEnrollmentModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{
           product_type: 'tuition',
           billing_mode: 'monthly',
           access_scope: 'class',
           billing_period_end: new Date(Date.now() - 100000) // EXPIRED!
        }])
      });

      const access = await service.hasTuitionAccess('s1', classId, subjectId);
      expect(access).toBe(false);
    });

    it('should verify standard fallback legacy flows safely ignoring extended payloads natively matching original test bounds', async () => {
      const courseId = new Types.ObjectId().toString();
      mockEnrollmentModel.findOne = jest.fn().mockResolvedValue(null);
      mockEnrollmentModel.create = jest.fn().mockImplementation((obj) => obj);

      const result = await service.enroll(courseId, 's1');

      expect(result.success).toBe(true);
      expect(mockEnrollmentModel.create).toHaveBeenCalledWith(expect.objectContaining({
        product_type: 'course'
      }));
    });
  });
});
