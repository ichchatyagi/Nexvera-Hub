import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getModelToken } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { Course } from './schemas/course.schema';
import { Review } from './schemas/review.schema';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { VideosService } from '../videos/videos.service';
import { UserRole } from '../users/entities/user.entity';
import { Types } from 'mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('Lessons Hardening (Gating & Previews)', () => {
  let service: CoursesService;
  let mockCourseModel: any;
  let mockEnrollmentsService: any;
  let mockVideosService: any;

  const lessonId = new Types.ObjectId();
  const courseId = new Types.ObjectId();
  const videoId = new Types.ObjectId();

  const mockCourse = {
    _id: courseId,
    status: 'published',
    curriculum: [
      {
        section_id: new Types.ObjectId(),
        lessons: [
          {
            lesson_id: lessonId,
            title: 'Test Lesson',
            type: 'video',
            is_preview: false,
            content: { video_id: videoId },
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    mockCourseModel = {
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourse),
      }),
    };
    mockEnrollmentsService = {
      isActiveCourseEnrollment: jest.fn().mockResolvedValue(false),
    };
    mockVideosService = {
      findById: jest.fn().mockResolvedValue({ _id: videoId, public_preview: false }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: getModelToken(Course.name), useValue: mockCourseModel },
        { provide: getModelToken(Review.name), useValue: {} },
        { provide: EnrollmentsService, useValue: mockEnrollmentsService },
        { provide: VideosService, useValue: mockVideosService },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  describe('findLessonById access control', () => {
    it('blocks anonymous access to non-preview lesson', async () => {
      await expect(service.findLessonById(lessonId.toString(), null, null))
        .rejects.toThrow(ForbiddenException);
    });

    it('allows anonymous access if lesson is_preview is true', async () => {
      mockCourse.curriculum[0].lessons[0].is_preview = true;
      const result = await service.findLessonById(lessonId.toString(), null, null);
      expect(result.success).toBe(true);
      expect(result.data.course_id).toEqual(courseId);
    });

    it('allows anonymous access if video public_preview is true (fallback)', async () => {
      mockCourse.curriculum[0].lessons[0].is_preview = false;
      mockVideosService.findById.mockResolvedValue({ _id: videoId, public_preview: true });
      
      const result = await service.findLessonById(lessonId.toString(), null, null);
      expect(result.success).toBe(true);
      expect(result.data.course_id).toEqual(courseId);
    });

    it('blocks enrolled student if status is suspended (handled by isActive enrollment)', async () => {
      mockCourse.curriculum[0].lessons[0].is_preview = false;
      mockVideosService.findById.mockResolvedValue({ _id: videoId, public_preview: false });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(false);

      await expect(service.findLessonById(lessonId.toString(), 'user1', UserRole.STUDENT))
        .rejects.toThrow(ForbiddenException);
    });

    it('allows enrolled student back in', async () => {
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(true);
      const result = await service.findLessonById(lessonId.toString(), 'user1', UserRole.STUDENT);
      expect(result.success).toBe(true);
    });

    it('returns course_id in the lesson data', async () => {
        mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(true);
        const result = await service.findLessonById(lessonId.toString(), 'user1', UserRole.STUDENT);
        expect(result.data).toHaveProperty('course_id');
        expect(result.data.course_id.toString()).toBe(courseId.toString());
    });
  });
});
