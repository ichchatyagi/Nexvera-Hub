import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Enrollment, EnrollmentDocument } from './schemas/enrollment.schema';
import { UpdateProgressDto } from './dto/enrollment.dto';
import { CoursesService } from '../courses/courses.service';

@Injectable()
export class EnrollmentsService {
  private readonly COMPLETION_THRESHOLD = 90;

  constructor(
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
    private readonly coursesService: CoursesService,
  ) {}

  async enroll(courseId: string, studentId: string, transactionId?: string) {
    if (!Types.ObjectId.isValid(courseId)) throw new NotFoundException('Invalid Course ID');
    
    // Check if already enrolled
    const existing = await this.enrollmentModel.findOne({
      course_id: new Types.ObjectId(courseId),
      student_id: studentId,
    });

    if (existing) {
      throw new ConflictException('Already enrolled in this course');
    }

    const enrollment = await this.enrollmentModel.create({
      course_id: new Types.ObjectId(courseId),
      student_id: studentId,
      transaction_id: transactionId,
      status: 'active',
      progress: {
        percentage: 0,
        completed_lessons: [],
      },
      watch_history: [],
    });

    return { success: true, data: enrollment };
  }

  async getProgress(courseId: string, studentId: string) {
    if (!Types.ObjectId.isValid(courseId)) throw new NotFoundException('Invalid Course ID');

    const enrollment = await this.enrollmentModel.findOne({
      course_id: new Types.ObjectId(courseId),
      student_id: studentId,
    }).exec();

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return { success: true, data: enrollment };
  }

  async checkEnrollment(courseId: string, studentId: string) {
    if (!Types.ObjectId.isValid(courseId)) {
        return { success: true, data: { isEnrolled: false } };
    }

    const enrollment = await this.enrollmentModel.findOne({
      course_id: new Types.ObjectId(courseId),
      student_id: studentId,
    }).exec();

    if (!enrollment) {
      return { success: true, data: { isEnrolled: false } };
    }

    return {
      success: true,
      data: {
        isEnrolled: true,
        status: enrollment.status,
        progressPercentage: enrollment.progress.percentage,
        currentLessonId: enrollment.progress.current_lesson || null,
        completedLessons: enrollment.progress.completed_lessons || [],
        isCompleted: enrollment.progress.percentage >= this.COMPLETION_THRESHOLD,
      },
    };
  }

  async updateProgress(courseId: string, studentId: string, dto: UpdateProgressDto) {
    if (!Types.ObjectId.isValid(courseId)) throw new NotFoundException('Invalid Course ID');

    const [enrollment, courseRes] = await Promise.all([
      this.enrollmentModel.findOne({
        course_id: new Types.ObjectId(courseId),
        student_id: studentId,
      }).exec(),
      this.coursesService.findById(courseId)
    ]);

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const course = courseRes.data;
    
    // Handle current lesson (support both camelCase and snake_case)
    const currentLessonId = dto.currentLessonId || dto.current_lesson;
    if (currentLessonId) {
        if (!Types.ObjectId.isValid(currentLessonId)) throw new NotFoundException('Invalid lesson ID');
        enrollment.progress.current_lesson = new Types.ObjectId(currentLessonId);
    }

    // Handle completed lessons
    const completedLessons = dto.completedLessons || dto.completed_lessons;
    if (completedLessons) {
      const ObjectIds = completedLessons.map(id => {
        if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid lesson ID: ' + id);
        return new Types.ObjectId(id);
      });
      // Merge unique lessons
      const currentIds = enrollment.progress.completed_lessons.map(id => id.toString());
      for (const id of ObjectIds) {
        if (!currentIds.includes(id.toString())) {
          enrollment.progress.completed_lessons.push(id);
        }
      }
    }

    // Server-side Percentage Calculation (Hardening Pass)
    // We compute this based on actual completed lessons count vs total lessons in curriculum
    let totalLessons = course.total_lessons || 0;
    
    // Fallback: If total_lessons is not set in stats, calculate from curriculum
    if (!totalLessons && course.curriculum) {
        totalLessons = course.curriculum.reduce((acc, section) => acc + (section.lessons?.length || 0), 0);
    }

    if (totalLessons > 0) {
        const completedCount = enrollment.progress.completed_lessons.length;
        enrollment.progress.percentage = Math.min(100, Math.round((completedCount / totalLessons) * 100));
    } else if (typeof dto.percentage === 'number') {
        // Fallback to client value only if course has no lessons (shouldn't happen)
        enrollment.progress.percentage = dto.percentage;
    }

    // Update watch history if video data provided
    if (currentLessonId && (dto.lastPositionSeconds !== undefined || dto.videoId)) {
        const lessonId = new Types.ObjectId(currentLessonId);
        let historyItemIndex = enrollment.watch_history.findIndex(item => item.lesson_id.toString() === currentLessonId);

        if (historyItemIndex === -1) {
            enrollment.watch_history.push({
                lesson_id: lessonId,
                video_id: dto.videoId ? new Types.ObjectId(dto.videoId) : undefined,
                last_position_seconds: dto.lastPositionSeconds || 0,
                watch_time_seconds: 0,
                progress_percentage: 0,
                updated_at: new Date()
            } as any);
        } else {
            const item = enrollment.watch_history[historyItemIndex];
            if (dto.lastPositionSeconds !== undefined) item.last_position_seconds = dto.lastPositionSeconds;
            if (dto.videoId) item.video_id = new Types.ObjectId(dto.videoId);
            item.updated_at = new Date();
        }
    }

    enrollment.progress.last_accessed = new Date();
    await enrollment.save();

    return { success: true, data: enrollment };
  }

  async getEnrolledCourses(studentId: string) {
    const enrollments = await this.enrollmentModel
      .find({ student_id: studentId })
      .populate('course_id', 'title slug thumbnail_url level total_lessons')
      .exec();

    const data = enrollments.map(e => {
      const course = e.course_id as any;
      return {
        courseId: course._id,
        courseTitle: course.title,
        courseSlug: course.slug,
        thumbnail_url: course.thumbnail_url,
        level: course.level,
        progressPercentage: e.progress.percentage,
        status: e.status,
        lastAccessed: e.progress.last_accessed,
        isCompleted: e.progress.percentage >= this.COMPLETION_THRESHOLD,
        currentLessonId: e.progress.current_lesson || null,
      };
    });

    return { success: true, data };
  }
}
