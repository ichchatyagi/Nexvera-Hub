import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { Course } from './schemas/course.schema';
import { Review } from './schemas/review.schema';
import { Types } from 'mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';
import { CreateCourseDto, ProductType, TuitionMetaDto } from './dto/course.dto';

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
      const dto: any = { title: 'Test Course', slug: 'test-course', lead_instructor_id: 't1' };
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
        exec: jest.fn().mockResolvedValue(mockCourses)
      });

      const result = await service.findAssignedToTeacher('t1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCourses);
      expect(mockCourseModel.find).toHaveBeenCalledWith({
        $or: [
          { lead_instructor_id: 't1' },
          { assigned_instructor_ids: 't1' }
        ]
      });
    });
  });

  describe('getTeacherCourseView', () => {
    it('should return course detail if assigned', async () => {
      const courseId = new Types.ObjectId().toString();
      const mockCourse = { _id: courseId, title: 'Course 1' };
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse)
      });

      const result = await service.getTeacherCourseView(courseId, 't1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCourse);
    });

    it('should throw ForbiddenException if not assigned', async () => {
      const courseId = new Types.ObjectId().toString();
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      await expect(service.getTeacherCourseView(courseId, 't1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findBySlug', () => {
    it('should query for regular courses only (excluding tuition)', async () => {
      const slug = 'some-slug';
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: '1', slug })
      });

      const result = await service.findBySlug(slug);

      expect(result.success).toBe(true);
      expect(mockCourseModel.findOne).toHaveBeenCalledWith({
        slug,
        product_type: { $ne: 'tuition' }
      });
    });

    it('should throw NotFoundException if course not found', async () => {
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      await expect(service.findBySlug('missing-slug')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createReview', () => {
    it('should create a review and update course stats', async () => {
      const courseId = new Types.ObjectId().toString();
      const mockSave = jest.fn();
      const mockCourse = {
        _id: courseId,
        stats: { total_reviews: 0, average_rating: 0 },
        save: mockSave,
      };

      mockReviewModel.findOne.mockResolvedValue(null);
      mockCourseModel.findById.mockResolvedValue(mockCourse);
      mockReviewModel.create.mockResolvedValue({ _id: 'r1', rating: 5 });

      const dto = { rating: 5, review_text: 'Great' };
      const result = await service.createReview(courseId, 's1', dto);

      expect(result.success).toBe(true);
      expect(mockReviewModel.create).toHaveBeenCalled();
      expect(mockCourse.stats.total_reviews).toBe(1);
      expect(mockCourse.stats.average_rating).toBe(5);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw an error if already reviewed', async () => {
      const courseId = new Types.ObjectId().toString();
      mockReviewModel.findOne.mockResolvedValue({ _id: 'r1' });
      
      const dto = { rating: 5 };
      await expect(service.createReview(courseId, 's1', dto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Tuition Endpoints', () => {
    it('findTuitionClasses should query product_type: tuition', async () => {
      const mockResult = [{ _id: 't1', title: 'Class 10 Tuition' }];
      mockCourseModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockResult)
        }),
      });
      mockCourseModel.countDocuments.mockResolvedValue(1);

      const result = await service.findTuitionClasses({});
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockCourseModel.find).toHaveBeenCalledWith({
        product_type: 'tuition',
        status: 'published',
      });
    });

    it('findTuitionClassBySlug should return class without syllabus', async () => {
      const mockCourse = { _id: 't1', slug: 'class-10' };
      mockCourseModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCourse)
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
          subjects: [
            { slug: 'math', status: 'published' }
          ]
        }
      };
      
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockClass),
      });

      const result = await service.findTuitionSubject(classId, 'math');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ slug: 'math', status: 'published' });
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
        expect(errors.find(e => e.property === 'category')).toBeDefined();
        expect(errors.find(e => e.property === 'pricing')).toBeDefined();
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
});

