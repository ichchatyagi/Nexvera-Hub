import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { Course } from './schemas/course.schema';
import { Review } from './schemas/review.schema';
import { Types } from 'mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

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
    it('should create a course as a teacher', async () => {
      const dto = { title: 'Test Course', slug: 'test-course' };
      mockCourseModel.create.mockResolvedValue({ _id: '1', teacher_id: 't1', ...dto });

      const result = await service.create('t1', dto);

      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Test Course');
      expect(mockCourseModel.create).toHaveBeenCalledWith({
        ...dto,
        teacher_id: 't1',
        status: 'draft',
      });
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
});
