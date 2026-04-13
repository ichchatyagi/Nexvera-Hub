import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TeacherTuitionService } from './teacher-tuition.service';
import { Course } from './schemas/course.schema';
import { Types } from 'mongoose';
import { ProductType } from './dto/course.dto';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

const mockCourseModel = {
  find: jest.fn(),
  findOne: jest.fn(),
};

describe('TeacherTuitionService', () => {
  let service: TeacherTuitionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherTuitionService,
        {
          provide: getModelToken(Course.name),
          useValue: mockCourseModel,
        },
      ],
    }).compile();

    service = module.get<TeacherTuitionService>(TeacherTuitionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAssignedSubjects', () => {
    it('should return combined class and subject instances matched to teacher', async () => {
      const mockCourse = {
        _id: 'class_1', title: 'Science 10', 
        tuition_meta: {
          class_level: 10,
          subjects: [
            { subject_id: 'sub_1', name: 'Physics', assigned_instructor_ids: ['t1'] },
            { subject_id: 'sub_2', name: 'Chem', assigned_instructor_ids: ['t2'] }
          ]
        }
      };
      
      mockCourseModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockCourse])
      });

      const result = await service.findAssignedSubjects('t1');
      expect(result.success).toBe(true);
      expect(result.data.length).toBe(1);
      expect(result.data[0].class.title).toBe('Science 10');
      expect(result.data[0].subject.name).toBe('Physics');
    });
  });

  describe('getSubjectTeachingView', () => {
    it('should correctly build output payload if assigned natively', async () => {
      const subjectId = new Types.ObjectId().toString();
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: '1', title: 'A', status: 'draft',
          tuition_meta: {
            class_level: 10,
            subjects: [{ subject_id: subjectId, lead_instructor_id: 't1' }]
          }
        })
      });

      const result = await service.getSubjectTeachingView(subjectId, 't1');
      expect(result.success).toBe(true);
      expect(result.data.subject.lead_instructor_id).toBe('t1');
      expect(result.data.class.title).toBe('A');
    });

    it('should throw ForbiddenException if teacher not assigned', async () => {
      const subjectId = new Types.ObjectId().toString();
      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          tuition_meta: {
            subjects: [{ subject_id: subjectId, assigned_instructor_ids: ['t2'] }]
          }
        })
      });

      await expect(service.getSubjectTeachingView(subjectId, 't1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addSection', () => {
    it('should push a new section securely into the targeted nested syllabus preventing top-level modification', async () => {
      const subjectId = new Types.ObjectId().toString();
      const mockSave = jest.fn();
      const topLevelCurriculum = [{ section_id: 'top1', title: 'Top level', lessons: [] }];
      
      const mockCourse = {
        curriculum: [...topLevelCurriculum], // Provide top level payload
        tuition_meta: {
          subjects: [{ subject_id: subjectId, lead_instructor_id: 't1', syllabus: [] }]
        },
        save: mockSave,
      };

      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      const result = await service.addSection(subjectId, 't1', { title: 'Chapter 1' } as any);
      expect(result.success).toBe(true);
      expect(mockCourse.tuition_meta.subjects[0].syllabus.length).toBe(1);
      expect(mockCourse.tuition_meta.subjects[0].syllabus[0].title).toBe('Chapter 1');
      expect(mockCourse.curriculum).toEqual(topLevelCurriculum); // Ensure untreated
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('updateSection', () => {
    it('should update specific section metadata safely', async () => {
      const subjectId = new Types.ObjectId().toString();
      const sectionId = new Types.ObjectId().toString();
      const mockSave = jest.fn();
      
      const mockCourse = {
        curriculum: [],
        tuition_meta: {
          subjects: [{
            subject_id: subjectId,
            lead_instructor_id: 't1',
            syllabus: [{ section_id: sectionId, title: 'Old Title', order: 0, lessons: [] }]
          }]
        },
        save: mockSave,
      };

      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      const result = await service.updateSection(subjectId, 't1', sectionId, { title: 'New Title' });
      expect(result.success).toBe(true);
      expect(mockCourse.tuition_meta.subjects[0].syllabus[0].title).toBe('New Title');
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('addLesson', () => {
    it('should append a lesson to the correct section syllabus safely', async () => {
      const subjectId = new Types.ObjectId().toString();
      const sectionId = new Types.ObjectId().toString();
      const mockSave = jest.fn();
      
      const mockCourse = {
        curriculum: [],
        tuition_meta: {
          subjects: [{
            subject_id: subjectId,
            lead_instructor_id: 't1',
            syllabus: [{ section_id: sectionId, title: 'Chapter 1', lessons: [] }]
          }]
        },
        save: mockSave,
      };

      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      const result = await service.addLesson(subjectId, 't1', sectionId, { title: 'Lesson A', type: 'video', duration_minutes: 10 } as any);
      expect(result.success).toBe(true);
      const section = mockCourse.tuition_meta.subjects[0].syllabus[0];
      expect(section.lessons.length).toBe(1);
      expect(section.lessons[0].title).toBe('Lesson A');
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('updateLesson', () => {
    it('should update partial lesson fields preserving existing data natively and top-level explicitly', async () => {
      const subjectId = new Types.ObjectId().toString();
      const sectionId = new Types.ObjectId().toString();
      const lessonId = new Types.ObjectId().toString();
      const mockSave = jest.fn();
      const topLevelCurriculum = [{ section_id: 'top1', title: 'Top level', lessons: [{ lesson_id: 'l1', title: 'Top Lesson' }] }];
      
      const mockCourse = {
        curriculum: [...topLevelCurriculum],
        tuition_meta: {
          subjects: [{
            subject_id: subjectId,
            lead_instructor_id: 't1',
            syllabus: [{
              section_id: sectionId,
              lessons: [{
                lesson_id: lessonId,
                title: 'Lesson 1',
                type: 'video',
                content: { video_id: new Types.ObjectId() }
              }]
            }]
          }]
        },
        save: mockSave,
      };

      mockCourseModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      });

      const updateDto = { title: 'New Lesson Title' } as any;
      const result = await service.updateLesson(subjectId, 't1', sectionId, lessonId, updateDto);

      expect(result.success).toBe(true);
      const updatedLesson = mockCourse.tuition_meta.subjects[0].syllabus[0].lessons[0];
      expect(updatedLesson.title).toBe('New Lesson Title');
      expect(updatedLesson.type).toBe('video'); // preserved natively
      expect(updatedLesson.content.video_id).toBeDefined(); // preserved natively
      expect(mockCourse.curriculum).toEqual(topLevelCurriculum); // Assert isolation successfully
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('Invalid IDs validation', () => {
    it('should throw BadRequestException mapping invalid target inputs natively', async () => {
      const validClassId = new Types.ObjectId().toString();
      const validSectionId = new Types.ObjectId().toString();
      
      await expect(service.getSubjectTeachingView('bad_subject', 't1')).rejects.toThrow(BadRequestException);
      await expect(service.updateSection(validClassId, 't1', 'bad_section', {})).rejects.toThrow(BadRequestException);
      await expect(service.addLesson(validClassId, 't1', 'bad_section', {} as any)).rejects.toThrow(BadRequestException);
      await expect(service.updateLesson(validClassId, 't1', validSectionId, 'bad_lesson', {} as any)).rejects.toThrow(BadRequestException);
    });
  });
});
