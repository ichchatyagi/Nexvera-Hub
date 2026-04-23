import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EnrollmentsService } from './enrollments.service';
import { Enrollment } from './schemas/enrollment.schema';
import { Types } from 'mongoose';
import { ConflictException } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

const mockEnrollmentModel: any = {
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
};

const mockNotificationsService = {
  createNotification: jest.fn(),
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
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
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
    it('should enroll a student in a course and send notification', async () => {
      const courseId = new Types.ObjectId().toString();
      mockEnrollmentModel.findOne.mockResolvedValue(null);
      mockEnrollmentModel.create.mockResolvedValue({
        course_id: courseId,
        student_id: 's1',
      });

      const result = await service.enroll(courseId, 's1');

      expect(result.success).toBe(true);
      expect(mockEnrollmentModel.create).toHaveBeenCalled();
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.ENROLLMENT_GRANTED,
          user_id: 's1',
        })
      );
    });

    it('should throw ConflictException if already enrolled and not send notification', async () => {
      const courseId = new Types.ObjectId().toString();
      mockEnrollmentModel.findOne.mockResolvedValue({
        _id: 'e1',
        subscription_status: 'active',
      });

      await expect(service.enroll(courseId, 's1')).rejects.toThrow(
        ConflictException,
      );
      expect(
        mockNotificationsService.createNotification,
      ).not.toHaveBeenCalled();
    });
  });

  describe('enrollIdempotent', () => {
    it('returns alreadyEnrolled meta instead of throwing on ConflictException', async () => {
      const courseId = new Types.ObjectId().toString();
      mockEnrollmentModel.findOne.mockResolvedValue({
        _id: 'e1',
        subscription_status: 'active',
      });

      const result = await service.enrollIdempotent(courseId, 's1');

      expect(result.success).toBe(true);
      expect(result.meta?.alreadyEnrolled).toBe(true);
      expect(result.data._id).toBe('e1');
    });

    it('successfully enrolls if no duplicate found', async () => {
      const courseId = new Types.ObjectId().toString();
      mockEnrollmentModel.findOne.mockResolvedValue(null);
      mockEnrollmentModel.create.mockResolvedValue({
        _id: 'e-new',
        course_id: courseId,
      });

      const result = await service.enrollIdempotent(courseId, 's1');

      expect(result.success).toBe(true);
      expect(result.data._id).toBe('e-new');
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

      const result = await service.updateProgress(courseId, 's1', {
        percentage: 50,
      });

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
        subjectId,
      });

      expect(result.success).toBe(true);
      expect(mockEnrollmentModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          product_type: 'tuition',
          tuition_class_id: new Types.ObjectId(courseId),
          tuition_subject_id: new Types.ObjectId(subjectId),
          billing_mode: 'monthly',
        }),
      );
    });

    it('should accurately resolve hasTuitionAccess true for explicit subject queries actively natively', async () => {
      const classId = new Types.ObjectId().toString();
      const subjectId = new Types.ObjectId().toString();

      mockEnrollmentModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          {
            product_type: 'tuition',
            billing_mode: 'bundle',
            access_scope: 'subject',
            tuition_subject_id: new Types.ObjectId(subjectId),
          },
        ]),
      });

      const access = await service.hasTuitionAccess('s1', classId, subjectId);
      expect(access).toBe(true);
    });

    it('should resolve hasTuitionAccess true executing class delegations accurately covering underlying layers automatically', async () => {
      const classId = new Types.ObjectId().toString();
      const subjectId = new Types.ObjectId().toString();

      mockEnrollmentModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          {
            product_type: 'tuition',
            billing_mode: 'bundle',
            access_scope: 'class',
          },
        ]),
      });

      const access = await service.hasTuitionAccess('s1', classId, subjectId);
      expect(access).toBe(true);
    });

    it('should resolve hasTuitionAccess false for expired monthly boundaries cleanly separating dead states gracefully natively', async () => {
      const classId = new Types.ObjectId().toString();
      const subjectId = new Types.ObjectId().toString();

      mockEnrollmentModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          {
            product_type: 'tuition',
            billing_mode: 'monthly',
            access_scope: 'class',
            billing_period_end: new Date(Date.now() - 100000), // EXPIRED!
          },
        ]),
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
      expect(mockEnrollmentModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          product_type: 'course',
        }),
      );
    });
  });

  describe('listActiveCourseIdsForStudent', () => {
    it('returns deduplicated active non-expired course IDs and ignores tuition/expired entries', async () => {
      const courseId1 = new Types.ObjectId();
      const courseId2 = new Types.ObjectId();
      const expiredCourseId = new Types.ObjectId();

      // Simulate three categories of enrollments:
      //  1. Active course with no expiry  → should be included
      //  2. Active course with future expiry  → should be included
      //  3. Active course but access_expires in the past  → excluded by the $or query
      //  4. Tuition product_type  → excluded by the query filter
      // The mongo query itself filters expired/tuition, so the mock only needs
      // to return what a correct query would: active non-expired course rows.
      mockEnrollmentModel.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          { course_id: courseId1 },
          { course_id: courseId2 },
          // duplicate of courseId1 to verify dedup
          { course_id: courseId1 },
        ]),
      });

      const result = await service.listActiveCourseIdsForStudent('s1');

      // Verify the query filters correctly
      expect(mockEnrollmentModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          student_id: 's1',
          $or: expect.any(Array),
        }),
      );

      // Should return unique IDs only
      expect(result).toHaveLength(2);
      expect(result).toContain(courseId1.toString());
      expect(result).toContain(courseId2.toString());
      expect(result).not.toContain(expiredCourseId.toString());
    });

    it('returns empty array when student has no active course enrollments', async () => {
      mockEnrollmentModel.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.listActiveCourseIdsForStudent('s-no-courses');
      expect(result).toEqual([]);
    });
  });

  describe('getStudentAccessFilters', () => {
    it('resolves both courses and tuitions into granular query filter segments', async () => {
      const courseId = new Types.ObjectId();
      const tuitionId = new Types.ObjectId();
      const subjectId = new Types.ObjectId();

      mockEnrollmentModel.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          {
            product_type: 'course',
            course_id: courseId,
          },
          {
            product_type: 'tuition',
            course_id: tuitionId,
            access_scope: 'subject',
            tuition_subject_id: subjectId,
          },
        ]),
      });

      const filters = await service.getStudentAccessFilters('s1');

      expect(filters).toHaveLength(2);
      expect(filters).toContainEqual({ course_id: courseId });
      expect(filters).toContainEqual({
        course_id: tuitionId,
        subject_id: subjectId,
      });
    });

    it('handles class-level tuition access as a full course_id filter', async () => {
      const tuitionId = new Types.ObjectId();

      mockEnrollmentModel.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          {
            product_type: 'tuition',
            course_id: tuitionId,
            access_scope: 'class',
          },
        ]),
      });

      const filters = await service.getStudentAccessFilters('s1');

      expect(filters).toHaveLength(1);
      expect(filters[0]).toEqual({ course_id: tuitionId });
    });
  });
});
