import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { Course } from './schemas/course.schema';
import { Review } from './schemas/review.schema';
import { Types } from 'mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';
import { CreateCourseDto, ProductType, TuitionMetaDto } from './dto/course.dto';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { UserRole } from '../users/entities/user.entity';
import { VideosService } from '../videos/videos.service';

const mockCourseModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  countDocuments: jest.fn(),
};

const mockReviewModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  countDocuments: jest.fn(),
};

const mockEnrollmentsService = {
  isActiveCourseEnrollment: jest.fn(),
};

const mockVideosService = {
  setPublicPreview: jest.fn().mockResolvedValue({ success: true }),
};

describe('CoursesService', () => {
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getModelToken(Course.name),
          useValue: mockCourseModel,
        },
        {
          provide: getModelToken(Review.name),
          useValue: mockReviewModel,
        },
        {
          provide: EnrollmentsService,
          useValue: mockEnrollmentsService,
        },
        {
          provide: VideosService,
          useValue: mockVideosService,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCourse', () => {
    it('should create a course as an admin', async () => {
      const dto: any = {
        title: 'Test Course',
        slug: 'test-course',
        lead_instructor_id: 't1',
      };
      mockCourseModel.create.mockResolvedValue({ _id: '1', ...dto });

      const result = await service.create(dto);

      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Test Course');
      expect(mockCourseModel.create).toHaveBeenCalledWith({
        ...dto,
        status: 'draft',
      });
    });
  });

  describe('findAssignedToTeacher', () => {
    it('should return courses where teacher is lead or assigned', async () => {
      const mockCourses = [{ _id: 'c1', title: 'Course 1' }];
      mockCourseModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourses),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
      });

      const result = await service.findAssignedToTeacher('t1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCourses);
      expect(mockCourseModel.find).toHaveBeenCalledWith({
        $or: [{ lead_instructor_id: 't1' }, { assigned_instructor_ids: 't1' }],
      });
    });
  });

  describe('getTeacherCourseView', () => {
    it('should return course detail if assigned', async () => {
      const courseId = new Types.ObjectId().toString();
      const mockCourse = { _id: courseId, title: 'Course 1' };
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      const result = await service.getTeacherCourseView(courseId, 't1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCourse);
    });

    it('should throw ForbiddenException if not assigned', async () => {
      const courseId = new Types.ObjectId().toString();
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.getTeacherCourseView(courseId, 't1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findBySlug', () => {
    it('should query for regular courses only (excluding tuition)', async () => {
      const slug = 'some-slug';
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: '1', slug, status: 'published' }),
      });

      const result = await service.findBySlug(slug);

      expect(result.success).toBe(true);
      expect(mockCourseModel.findOne).toHaveBeenCalledWith({
        slug,
        product_type: { $ne: 'tuition' },
      });
    });

    it('should throw NotFoundException if course not found', async () => {
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findBySlug('missing-slug')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should allow admin to see draft course', async () => {
      const slug = 'draft-slug';
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: '1', slug, status: 'draft', lead_instructor_id: 't1' }),
      });

      const result = await service.findBySlug(slug, 'admin-1', UserRole.ADMIN);
      expect(result.success).toBe(true);
    });

    it('should allow owner to see draft course', async () => {
      const slug = 'draft-slug';
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: '1', slug, status: 'draft', lead_instructor_id: 't1' }),
      });

      const result = await service.findBySlug(slug, 't1', UserRole.TEACHER);
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException for student/unauth on draft course', async () => {
      const slug = 'draft-slug';
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: '1', slug, status: 'draft', lead_instructor_id: 't1' }),
      });

      await expect(service.findBySlug(slug, 's1', UserRole.STUDENT)).rejects.toThrow(NotFoundException);
      await expect(service.findBySlug(slug, null, null)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCurriculum', () => {
    it('should return curriculum for published course', async () => {
      const courseId = new Types.ObjectId().toString();
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ 
          _id: courseId, 
          status: 'published',
          curriculum: [{ title: 'Section 1' }] 
        }),
      });

      const result = await service.getCurriculum(courseId);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('should hide draft curriculum from public/students', async () => {
      const courseId = new Types.ObjectId().toString();
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ 
          _id: courseId, 
          status: 'draft',
          lead_instructor_id: 't1'
        }),
      });

      await expect(service.getCurriculum(courseId, null, null)).rejects.toThrow(NotFoundException);
      await expect(service.getCurriculum(courseId, 's1', UserRole.STUDENT)).rejects.toThrow(NotFoundException);
    });

    it('should allow admin/owner to see draft curriculum', async () => {
      const courseId = new Types.ObjectId().toString();
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ 
          _id: courseId, 
          status: 'draft',
          lead_instructor_id: 't1',
          curriculum: []
        }),
      });

      const res1 = await service.getCurriculum(courseId, 'admin-1', UserRole.ADMIN);
      const res2 = await service.getCurriculum(courseId, 't1', UserRole.TEACHER);
      expect(res1.success).toBe(true);
      expect(res2.success).toBe(true);
    });
  });

  describe('createReview', () => {
    it('should create a review and update course stats for an enrolled student', async () => {
      const courseId = new Types.ObjectId().toString();
      const mockSave = jest.fn();
      const mockCourse = {
        _id: courseId,
        stats: { total_reviews: 0, average_rating: 0 },
        save: mockSave,
      };

      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(true);
      mockReviewModel.findOne.mockResolvedValue(null);
      mockCourseModel.findById.mockResolvedValue(mockCourse);
      mockReviewModel.create.mockResolvedValue({ _id: 'r1', rating: 5 });

      const dto = { rating: 5, review_text: 'Great' };
      const result = await service.createReview(courseId, 's1', UserRole.STUDENT, dto);

      expect(result.success).toBe(true);
      expect(mockReviewModel.create).toHaveBeenCalled();
      expect(mockCourse.stats.total_reviews).toBe(1);
      expect(mockCourse.stats.average_rating).toBe(5);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when student is not enrolled', async () => {
      const courseId = new Types.ObjectId().toString();

      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(false);

      const dto = { rating: 4, review_text: 'Not enrolled' };
      await expect(
        service.createReview(courseId, 's1', UserRole.STUDENT, dto),
      ).rejects.toThrow(ForbiddenException);

      // Must not proceed to create a review record
      expect(mockReviewModel.create).not.toHaveBeenCalled();
    });

    it('should allow admin to review without enrollment check', async () => {
      const courseId = new Types.ObjectId().toString();
      const mockSave = jest.fn();
      const mockCourse = {
        _id: courseId,
        stats: { total_reviews: 0, average_rating: 0 },
        save: mockSave,
      };

      mockReviewModel.findOne.mockResolvedValue(null);
      mockCourseModel.findById.mockResolvedValue(mockCourse);
      mockReviewModel.create.mockResolvedValue({ _id: 'r2', rating: 4 });

      const dto = { rating: 4, review_text: 'Admin review' };
      const result = await service.createReview(courseId, 'admin-1', UserRole.ADMIN, dto);

      expect(result.success).toBe(true);
      // Admin bypasses enrollment check entirely
      expect(mockEnrollmentsService.isActiveCourseEnrollment).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if already reviewed', async () => {
      const courseId = new Types.ObjectId().toString();

      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(true);
      mockReviewModel.findOne.mockResolvedValue({ _id: 'r1' });

      const dto = { rating: 5 };
      await expect(
        service.createReview(courseId, 's1', UserRole.STUDENT, dto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Tuition Endpoints', () => {
    it('findTuitionClasses should query product_type: tuition', async () => {
      const mockResult = [{ _id: 't1', title: 'Class 10 Tuition' }];
      mockCourseModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockResult),
      });
      mockCourseModel.countDocuments.mockResolvedValue(1);

      const result = await service.findTuitionClasses({});
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockCourseModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          product_type: 'tuition',
          status: 'published',
        }),
      );
    });

    it('findTuitionClasses with status=all and no admin role still forces published', async () => {
      mockCourseModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockCourseModel.countDocuments.mockResolvedValue(0);

      await service.findTuitionClasses({ status: 'all' }, null, null);
      
      expect(mockCourseModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'published' }),
      );
    });

    it('findTuitionClassBySlug should return class without syllabus', async () => {
      const mockCourse = { _id: 't1', slug: 'class-10' };
      mockCourseModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCourse),
        }),
      });

      const result = await service.findTuitionClassBySlug('class-10');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCourse);
    });

    it('findTuitionSubject should return specific subject from within class', async () => {
      const classId = new Types.ObjectId().toString();
      const mockClass = {
        _id: classId,
        tuition_meta: {
          subjects: [{ slug: 'math', status: 'published' }],
        },
      };

      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockClass),
      });

      const result = await service.findTuitionSubject(classId, 'math');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ slug: 'math', status: 'published' });
    });
  });

  describe('Search functionality', () => {
    it('should use $text when search length >= 2', async () => {
      mockCourseModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockCourseModel.countDocuments.mockResolvedValue(0);

      await service.findAll({ search: 'nest' });

      expect(mockCourseModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $text: { $search: 'nest' },
          status: 'published',
        }),
      );
    });

    it('findAll with status=all for admin removes status filter', async () => {
      mockCourseModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockCourseModel.countDocuments.mockResolvedValue(0);

      await service.findAll({ status: 'all' }, 'admin-1', UserRole.ADMIN);
      
      const filters = mockCourseModel.find.mock.calls[0][0];
      expect(filters.status).toBeUndefined();
    });

    it('findAll with status=all for unauth forces published filter', async () => {
      mockCourseModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockCourseModel.countDocuments.mockResolvedValue(0);

      await service.findAll({ status: 'all' });
      
      const filters = mockCourseModel.find.mock.calls[0][0];
      expect(filters.status).toBe('published');
    });

    it('should ignore search when length < 2', async () => {
      mockCourseModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockCourseModel.countDocuments.mockResolvedValue(0);

      await service.findAll({ search: 'a' });

      const filters = mockCourseModel.find.mock.calls[0][0];
      expect(filters.$text).toBeUndefined();
      expect(filters.$or).toBeUndefined();
    });

    it('should fall back to regex when $text errors', async () => {
      // First call throws
      mockCourseModel.find.mockReturnValueOnce({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('text index required')),
      });

      // Second call (fallback) succeeds
      mockCourseModel.find.mockReturnValueOnce({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockCourseModel.countDocuments.mockResolvedValue(0);

      await service.findAll({ search: 'nest' });

      // Verify second attempt used $or regex
      expect(mockCourseModel.find).toHaveBeenCalledTimes(2);
      expect(mockCourseModel.find).toHaveBeenLastCalledWith(
        expect.objectContaining({
          $or: [
            { title: { $regex: 'nest', $options: 'i' } },
            { description: { $regex: 'nest', $options: 'i' } },
          ],
        }),
      );
    });
  });

  describe('DTO Validation Checks', () => {
    it('should fail if regular course missing category/pricing', async () => {
      const dto = new CreateCourseDto();
      dto.title = 'Title';
      dto.slug = 'slug';
      dto.product_type = ProductType.COURSE;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.find((e) => e.property === 'category')).toBeDefined();
      expect(errors.find((e) => e.property === 'pricing')).toBeDefined();
    });

    it('should pass if tuition missing category/pricing', async () => {
      const dto = new CreateCourseDto();
      dto.title = 'Title';
      dto.slug = 'slug';
      dto.product_type = ProductType.TUITION;
      const meta = new TuitionMetaDto();
      meta.class_level = 10;
      dto.tuition_meta = meta;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if tuition class_level is out of bounds', async () => {
      const dto = new CreateCourseDto();
      dto.title = 'Title';
      dto.slug = 'slug';
      dto.product_type = ProductType.TUITION;
      const meta = new TuitionMetaDto();
      meta.class_level = 4; // Out of bounds min=5
      dto.tuition_meta = meta;

      const errors = await validate(dto);
      const metaError = errors.find((e: any) => e.property === 'tuition_meta');
      expect(metaError).toBeDefined();
      expect(metaError?.children?.[0].property).toBe('class_level');
      expect(metaError?.children?.[0].constraints?.min).toBeDefined();
    });
  });

  describe('findLessonById', () => {
    const lessonId = new Types.ObjectId().toString();
    const mockLesson = { lesson_id: lessonId, title: 'Lesson 1', is_preview: false };
    const mockCourse = {
      _id: new Types.ObjectId().toString(),
      status: 'published',
      lead_instructor_id: 't1',
      curriculum: [
        {
          lessons: [mockLesson],
        },
      ],
    };

    it('allows anyone to see a preview lesson in a published course', async () => {
      const previewLesson = { ...mockLesson, is_preview: true };
      const previewCourse = {
        ...mockCourse,
        curriculum: [{ lessons: [previewLesson] }],
      };
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(previewCourse),
      });

      const result = await service.findLessonById(lessonId, null, null);
      expect(result.success).toBe(true);
      expect(result.data.lesson_id.toString()).toBe(lessonId);
    });

    it('throws ForbiddenException for unauth user on non-preview lesson', async () => {
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      await expect(service.findLessonById(lessonId, null, null)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('allows enrolled student to see non-preview lesson', async () => {
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(true);

      const result = await service.findLessonById(lessonId, 's1', UserRole.STUDENT);
      expect(result.success).toBe(true);
    });

    it('throws ForbiddenException for non-enrolled student on non-preview lesson', async () => {
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(false);

      await expect(
        service.findLessonById(lessonId, 's1', UserRole.STUDENT),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows admin to see any lesson', async () => {
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      const result = await service.findLessonById(lessonId, 'admin-1', UserRole.ADMIN);
      expect(result.success).toBe(true);
    });

    it('allows instructor to see their own unpublished course lessons', async () => {
      const unpublishedCourse = { ...mockCourse, status: 'draft' };
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(unpublishedCourse),
      });

      const result = await service.findLessonById(lessonId, 't1', UserRole.TEACHER);
      expect(result.success).toBe(true);
    });

    it('throws ForbiddenException for student trying to see unpublished course lessons', async () => {
      const unpublishedCourse = { ...mockCourse, status: 'draft' };
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(unpublishedCourse),
      });

      await expect(
        service.findLessonById(lessonId, 's1', UserRole.STUDENT),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
