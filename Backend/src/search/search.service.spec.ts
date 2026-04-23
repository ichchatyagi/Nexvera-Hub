import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SearchService } from './search.service';
import { Course } from '../courses/schemas/course.schema';

describe('SearchService Hardening', () => {
  let service: SearchService;
  let mockCourseModel: any;

  beforeEach(async () => {
    mockCourseModel = {
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    };

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

  describe('Input Validation', () => {
    it('returns empty results for queries < 2 chars', async () => {
      const result = await service.suggest('a');
      expect(result.data.courses).toEqual([]);
      expect(mockCourseModel.aggregate).not.toHaveBeenCalled();
    });

    it('returns empty results for queries > 64 chars', async () => {
      const result = await service.suggest('a'.repeat(65));
      expect(result.data.courses).toEqual([]);
      expect(mockCourseModel.aggregate).not.toHaveBeenCalled();
    });

    it('trims whitespace', async () => {
      await service.suggest('  ab  ');
      // The first argument to aggregate is the pipeline
      const pipeline = mockCourseModel.aggregate.mock.calls[0][0];
      const matchStage = pipeline.find((s: any) => s.$match);
      expect(matchStage.$match.title.$regex).toBe('ab');
    });

    it('handles regex metacharacters safely', async () => {
      const result = await service.suggest('(a+)+');
      expect(result.success).toBe(true);
      const pipeline = mockCourseModel.aggregate.mock.calls[0][0];
      const matchStage = pipeline.find((s: any) => s.$match);
      expect(matchStage.$match.title.$regex).toBe('\\(a\\+\\)\\+');
    });
  });

  describe('Relevance Ordering', () => {
    it('ranks prefix matches higher using $addFields relevance', async () => {
      mockCourseModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          { _id: '1', title: 'Calculus 101', relevance: 2 },
          { _id: '2', title: 'Advanced Calculus', relevance: 1 },
        ]),
      });

      const result = await service.suggest('Calc');
      
      // Verify pipeline contains relevance logic
      const pipeline = mockCourseModel.aggregate.mock.calls[0][0];
      const addFieldsStage = pipeline.find((s: any) => s.$addFields);
      expect(addFieldsStage.$addFields.relevance).toBeDefined();
      
      const sortStage = pipeline.find((s: any) => s.$sort);
      expect(sortStage.$sort.relevance).toBe(-1);

      expect(result.data.courses[0].title).toBe('Calculus 101');
    });
  });

  describe('Stable Payload', () => {
    it('stringifies Mongo ObjectIds and hides internal fields', async () => {
      mockCourseModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          { 
            _id: { toString: () => 'mongo-id-123' }, 
            title: 'Test Course',
            slug: 'test-course',
            relevance: 2 // Should be removed in mapping
          },
        ]),
      });

      const result = await service.suggest('test');
      const course = result.data.courses[0];
      
      expect(course.id).toBe('mongo-id-123');
      expect(course).not.toHaveProperty('_id');
      expect(course).not.toHaveProperty('relevance');
      expect(course.type).toBe('course');
    });
  });
});
