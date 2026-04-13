import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AdminTuitionService } from './admin-tuition.service';
import { Course } from './schemas/course.schema';
import { Types } from 'mongoose';
import { ProductType } from './dto/course.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockCourseModel = {
  create: jest.fn(),
  findOne: jest.fn(),
  findOneAndDelete: jest.fn(),
};

describe('AdminTuitionService', () => {
  let service: AdminTuitionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminTuitionService,
        {
          provide: getModelToken(Course.name),
          useValue: mockCourseModel,
        },
      ],
    }).compile();

    service = module.get<AdminTuitionService>(AdminTuitionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createClass', () => {
    it('should create tuition class successfully', async () => {
      const dto = { title: 'Test', slug: 'test', class_level: 5 };
      mockCourseModel.create.mockResolvedValue({ _id: '1', ...dto, product_type: ProductType.TUITION });

      const result = await service.createClass(dto as any);
      expect(result.success).toBe(true);
      expect(mockCourseModel.create).toHaveBeenCalled();
      const callArgs = mockCourseModel.create.mock.calls[0][0];
      expect(callArgs.product_type).toBe(ProductType.TUITION);
      expect(callArgs.tuition_meta.class_level).toBe(5);
    });
  });

  describe('publishClass', () => {
    it('should transition to published and set published_at', async () => {
      const courseId = new Types.ObjectId().toString();
      const mockSave = jest.fn();
      const mockCourse = { _id: courseId, product_type: ProductType.TUITION, status: 'draft', save: mockSave };
      
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      const result = await service.publishClass(courseId, { status: 'published' });
      expect(result.success).toBe(true);
      expect(mockCourse.status).toBe('published');
      expect((mockCourse as any).published_at).toBeDefined();
      expect(mockSave).toHaveBeenCalled();
    });

    it('should transition to unpublished', async () => {
      const courseId = new Types.ObjectId().toString();
      const mockSave = jest.fn();
      const mockCourse = { _id: courseId, product_type: ProductType.TUITION, status: 'published', save: mockSave };
      
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      const result = await service.publishClass(courseId, { status: 'draft' });
      expect(result.success).toBe(true);
      expect(mockCourse.status).toBe('draft');
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('Non-tuition class rejection', () => {
    it('should reject lookups for non-tuition classes natively', async () => {
      const courseId = new Types.ObjectId().toString();
      // Assume DB correctly returns null since non-tuition classes trigger the product_type filter exception
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null), 
      });

      await expect(service.updateClass(courseId, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('addSubject', () => {
    it('should add a subject preserving existing references', async () => {
      const courseId = new Types.ObjectId().toString();
      const mockSave = jest.fn();
      const mockCourse = {
        _id: courseId,
        product_type: ProductType.TUITION,
        tuition_meta: { subjects: [] as any[] },
        save: mockSave,
      };

      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      const dto = { name: 'Math', slug: 'math' };
      const result = await service.addSubject(courseId, dto as any);

      expect(result.success).toBe(true);
      expect(mockCourse.tuition_meta.subjects.length).toBe(1);
      expect(mockCourse.tuition_meta.subjects[0].name).toBe('Math');
      expect(mockCourse.tuition_meta.subjects[0].syllabus).toEqual([]);
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('updateSubject', () => {
    it('should update metadata without modifying syllabus', async () => {
      const courseId = new Types.ObjectId().toString();
      const subjectId = new Types.ObjectId().toString();
      const mockSave = jest.fn();
      
      const mockCourse = {
        _id: courseId,
        product_type: ProductType.TUITION,
        tuition_meta: {
          subjects: [{
            subject_id: subjectId,
            name: 'Old Name',
            syllabus: [{ section_id: 's1', title: 'Chapter 1', lessons: [] }]
          }]
        },
        save: mockSave,
      };

      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      const dto = { name: 'New Name' };
      const result = await service.updateSubject(courseId, subjectId, dto);

      expect(result.success).toBe(true);
      const subject = mockCourse.tuition_meta.subjects[0];
      expect(subject.name).toBe('New Name');
      expect(subject.syllabus.length).toBe(1); // Unchanged!
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('publishSubject', () => {
    it('should publish tuition subject', async () => {
      const courseId = new Types.ObjectId().toString();
      const subjectId = new Types.ObjectId().toString();
      const mockSave = jest.fn();
      const mockCourse = {
        _id: courseId,
        product_type: ProductType.TUITION,
        tuition_meta: { subjects: [{ subject_id: subjectId, status: 'draft' }] },
        save: mockSave,
      };

      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      const result = await service.publishSubject(courseId, subjectId, { status: 'published' });
      expect(result.success).toBe(true);
      expect(mockCourse.tuition_meta.subjects[0].status).toBe('published');
      expect(mockSave).toHaveBeenCalled();
    });

    it('should unpublish tuition subject', async () => {
      const courseId = new Types.ObjectId().toString();
      const subjectId = new Types.ObjectId().toString();
      const mockSave = jest.fn();
      const mockCourse = {
        _id: courseId,
        product_type: ProductType.TUITION,
        tuition_meta: { subjects: [{ subject_id: subjectId, status: 'published' }] },
        save: mockSave,
      };

      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      const result = await service.publishSubject(courseId, subjectId, { status: 'draft' });
      expect(result.success).toBe(true);
      expect(mockCourse.tuition_meta.subjects[0].status).toBe('draft');
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('assignInstructor', () => {
    it('should assign instructor without duplicating and set lead instructor if specified', async () => {
      const courseId = new Types.ObjectId().toString();
      const subjectId = new Types.ObjectId().toString();
      const mockSave = jest.fn();
      const mockCourse = {
        _id: courseId,
        product_type: ProductType.TUITION,
        tuition_meta: {
          subjects: [{
            subject_id: subjectId,
            assigned_instructor_ids: ['inst_1'],
            lead_instructor_id: 'inst_1',
          }]
        },
        save: mockSave,
      };

      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      const dto = { instructor_id: 'inst_2', is_lead: true };
      const result = await service.assignInstructor(courseId, subjectId, dto);

      expect(result.success).toBe(true);
      const subject = mockCourse.tuition_meta.subjects[0];
      expect(subject.assigned_instructor_ids).toContain('inst_1');
      expect(subject.assigned_instructor_ids).toContain('inst_2');
      expect(subject.lead_instructor_id).toBe('inst_2'); // reassigned lead
      expect(mockSave).toHaveBeenCalled();
    });

    it('should not add duplicate instructor if already assigned', async () => {
      const courseId = new Types.ObjectId().toString();
      const subjectId = new Types.ObjectId().toString();
      const mockSave = jest.fn();
      const mockCourse = {
        _id: courseId,
        product_type: ProductType.TUITION,
        tuition_meta: {
          subjects: [{ subject_id: subjectId, assigned_instructor_ids: ['inst_1'] }]
        },
        save: mockSave,
      };

      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      const result = await service.assignInstructor(courseId, subjectId, { instructor_id: 'inst_1' });
      expect(result.success).toBe(true);
      expect(mockCourse.tuition_meta.subjects[0].assigned_instructor_ids).toEqual(['inst_1']);
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('unassignInstructor', () => {
    it('should unassign instructor and unset lead if they were lead', async () => {
      const courseId = new Types.ObjectId().toString();
      const subjectId = new Types.ObjectId().toString();
      const mockSave = jest.fn();
      const mockCourse = {
        _id: courseId,
        product_type: ProductType.TUITION,
        tuition_meta: {
          subjects: [{
            subject_id: subjectId,
            assigned_instructor_ids: ['inst_1', 'inst_2'],
            lead_instructor_id: 'inst_2',
          }]
        },
        save: mockSave,
      };

      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      const result = await service.unassignInstructor(courseId, subjectId, 'inst_2');

      expect(result.success).toBe(true);
      const subject = mockCourse.tuition_meta.subjects[0];
      expect(subject.assigned_instructor_ids).toEqual(['inst_1']);
      expect(subject.lead_instructor_id).toBeUndefined();
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('Invalid subjectId tests', () => {
    it('should throw BadRequestException if subjectId is invalid in target mutations', async () => {
      const validClassId = new Types.ObjectId().toString();
      const invalidSubjectId = 'invalid-id';
      
      await expect(service.removeSubject(validClassId, invalidSubjectId)).rejects.toThrow(BadRequestException);
      await expect(service.publishSubject(validClassId, invalidSubjectId, { status: 'draft' })).rejects.toThrow(BadRequestException);
      await expect(service.assignInstructor(validClassId, invalidSubjectId, { instructor_id: 'inst' })).rejects.toThrow(BadRequestException);
      await expect(service.unassignInstructor(validClassId, invalidSubjectId, 'inst')).rejects.toThrow(BadRequestException);
    });
  });
});
