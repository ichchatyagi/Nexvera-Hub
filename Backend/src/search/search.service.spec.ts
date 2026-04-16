import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SearchService } from './search.service';
import { Course } from '../courses/schemas/course.schema';

const mockCourseModel = {
  find: jest.fn(),
  aggregate: jest.fn(),
};

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: getModelToken(Course.name),
          useValue: mockCourseModel,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('escapeRegex', () => {
    it('should escape regex metacharacters', () => {
      const input = '(a+)+';
      const escaped = service.escapeRegex(input);
      expect(escaped).toBe('\\(a\\+\\)\\+');
      expect(() => new RegExp(escaped)).not.toThrow();
    });

    it('should escape all common metacharacters', () => {
      const input = '.*+?^${}()|[]\\';
      const escaped = service.escapeRegex(input);
      expect(escaped).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
    });
  });

  describe('suggest', () => {
    it('should return empty buckets if q is shorter than 2', async () => {
      const result = await service.suggest('a');
      expect(result.success).toBe(true);
      expect(result.data.courses).toEqual([]);
      expect(result.data.tuition_classes).toEqual([]);
      expect(result.data.tuition_subjects).toEqual([]);
      expect(mockCourseModel.find).not.toHaveBeenCalled();
    });

    it('should handle missing or empty q', async () => {
      const result = await service.suggest('');
      expect(result.data.courses).toEqual([]);
      expect(mockCourseModel.find).not.toHaveBeenCalled();
    });

    it('should return tuition subjects with mapped fields from aggregation', async () => {
      const mockAggregationResult = [
        {
          classId: 'c1',
          classSlug: 'class-slug',
          classTitle: 'Class Title',
          class_level: 10,
          subjectId: 's1',
          subjectSlug: 'subject-slug',
          subjectName: 'Subject Name',
        },
      ];

      mockCourseModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      mockCourseModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregationResult),
      });

      const result = await service.suggest('subject');

      expect(result.success).toBe(true);
      expect(result.data.tuition_subjects).toHaveLength(1);
      expect(result.data.tuition_subjects[0]).toEqual({
        type: 'tuition_subject',
        classId: 'c1',
        classSlug: 'class-slug',
        classTitle: 'Class Title',
        class_level: 10,
        subjectId: 's1',
        subjectSlug: 'subject-slug',
        subjectName: 'Subject Name',
      });
    });

    it('should truncate query to 64 characters', async () => {
      const longQuery = 'a'.repeat(100);
      mockCourseModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockCourseModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      await service.suggest(longQuery);
      
      // We check that it was called once for courses, once for tuition classes
      expect(mockCourseModel.find).toHaveBeenCalledTimes(2);
      expect(mockCourseModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });
});
