import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Enrollment, EnrollmentDocument } from './schemas/enrollment.schema';
import { UpdateProgressDto } from './dto/enrollment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async enroll(courseId: string, studentId: string, metadata?: any) {
    if (!Types.ObjectId.isValid(courseId))
      throw new NotFoundException('Invalid Course ID');

    const isTuition = metadata?.product_type === 'tuition';

    const filter: any = {
      course_id: new Types.ObjectId(courseId),
      student_id: studentId,
      product_type: isTuition ? 'tuition' : 'course',
    };

    if (isTuition) {
      filter.access_scope = metadata.access_scope;
      if (metadata.access_scope === 'subject' && metadata.subjectId) {
        filter.tuition_subject_id = new Types.ObjectId(metadata.subjectId);
      }
    }

    const existing = await this.enrollmentModel.findOne(filter);

    if (existing && existing.subscription_status !== 'expired') {
      throw new ConflictException('Already actively enrolled in this target');
    }

    const enrollmentData: any = {
      course_id: new Types.ObjectId(courseId),
      student_id: studentId,
      status: 'active',
      product_type: isTuition ? 'tuition' : 'course',
      progress: {
        percentage: 0,
        completed_lessons: [],
      },
      watch_history: [],
    };

    if (isTuition) {
      enrollmentData.tuition_class_id = new Types.ObjectId(courseId);
      enrollmentData.access_scope = metadata.access_scope;
      enrollmentData.billing_mode = metadata.billing_mode;
      enrollmentData.subscription_status = 'active';

      if (metadata.access_scope === 'subject' && metadata.subjectId) {
        enrollmentData.tuition_subject_id = new Types.ObjectId(
          metadata.subjectId,
        );
      }

      if (metadata.billing_mode === 'monthly') {
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 30);
        enrollmentData.billing_period_start = start;
        enrollmentData.billing_period_end = end;
      }
    }

    const notify = async () => {
      try {
        await this.notificationsService.createNotification({
          user_id: studentId,
          type: NotificationType.ENROLLMENT_GRANTED,
          title: 'Enrollment granted',
          body: metadata?.courseTitle
            ? `You now have access to "${metadata.courseTitle}".`
            : `You now have access to your course.`,
          data: {
            courseId,
            product_type: metadata?.product_type ?? 'course',
            access_scope: metadata?.access_scope,
            subjectId: metadata?.subjectId,
            billing_mode: metadata?.billing_mode,
          },
        });
      } catch (err) {
        console.error('Failed to send enrollment notification:', err);
      }
    };

    if (existing) {
      Object.assign(existing, enrollmentData);
      await existing.save();
      await notify();
      return { success: true, data: existing };
    }

    const enrollment = await this.enrollmentModel.create(enrollmentData);
    await notify();
    return { success: true, data: enrollment };
  }

  /**
   * Idempotent enrollment: Returns consistent success even if already enrolled.
   */
  async enrollIdempotent(course_id: string, student_id: string, metadata?: any) {
    try {
      return await this.enroll(course_id, student_id, metadata);
    } catch (err) {
      if (err instanceof ConflictException) {
        const isTuition = metadata?.product_type === 'tuition';
        const filter: any = {
          course_id: new Types.ObjectId(course_id),
          student_id: student_id,
          product_type: isTuition ? 'tuition' : 'course',
        };
        if (isTuition) {
          filter.access_scope = metadata.access_scope;
          if (metadata.access_scope === 'subject' && metadata.subjectId) {
            filter.tuition_subject_id = new Types.ObjectId(metadata.subjectId);
          }
        }
        const existing = await this.enrollmentModel.findOne(filter);
        return {
          success: true,
          data: existing,
          meta: { alreadyEnrolled: true },
        };
      }
      throw err;
    }
  }

  async getProgress(courseId: string, studentId: string) {
    if (!Types.ObjectId.isValid(courseId))
      throw new NotFoundException('Invalid Course ID');

    const enrollment = await this.enrollmentModel
      .findOne({
        course_id: new Types.ObjectId(courseId),
        student_id: studentId,
      })
      .exec();

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return { success: true, data: enrollment };
  }

  async updateProgress(
    courseId: string,
    studentId: string,
    dto: UpdateProgressDto,
  ) {
    if (!Types.ObjectId.isValid(courseId))
      throw new NotFoundException('Invalid Course ID');

    const enrollment = await this.enrollmentModel
      .findOne({
        course_id: new Types.ObjectId(courseId),
        student_id: studentId,
      })
      .exec();

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (typeof dto.percentage === 'number') {
      enrollment.progress.percentage = dto.percentage;
    }

    if (dto.current_lesson) {
      if (!Types.ObjectId.isValid(dto.current_lesson))
        throw new NotFoundException('Invalid lesson ID');
      enrollment.progress.current_lesson = new Types.ObjectId(
        dto.current_lesson,
      );
    }

    if (dto.completed_lessons) {
      const ObjectIds = dto.completed_lessons.map((id) => {
        if (!Types.ObjectId.isValid(id))
          throw new NotFoundException('Invalid lesson ID: ' + id);
        return new Types.ObjectId(id);
      });
      // Merge unique lessons
      const currentIds = enrollment.progress.completed_lessons.map((id) =>
        id.toString(),
      );
      for (const id of ObjectIds) {
        if (!currentIds.includes(id.toString())) {
          enrollment.progress.completed_lessons.push(id);
        }
      }
    }

    enrollment.progress.last_accessed = new Date();
    await enrollment.save();

    return { success: true, data: enrollment };
  }

  async findByCourse(courseId: string) {
    if (!Types.ObjectId.isValid(courseId))
      throw new NotFoundException('Invalid Course ID');
    const list = await this.enrollmentModel
      .find({ course_id: new Types.ObjectId(courseId) })
      .exec();
    return { success: true, data: list };
  }

  async findByStudent(studentId: string) {
    const enrollments = await this.enrollmentModel
      .find({ student_id: studentId })
      .populate('course_id')
      .exec();

    const formatted = enrollments.map((enr) => {
      const obj = enr.toObject();
      const course = obj.course_id as any;

      return {
        ...obj,
        // Adapt course shape for dashboard UI expectations
        course: course
          ? {
              title: course.title,
              slug: course.slug,
              thumbnail_url: course.thumbnail_url,
              category: course.category?.main || 'General',
              level: course.level,
              teacher_name: course.lead_instructor_id || 'Nexvera Faculty',
              first_lesson_id:
                course.curriculum?.[0]?.lessons?.[0]?.lesson_id || null,
            }
          : null,
      };
    });

    return { success: true, data: formatted };
  }

  async hasTuitionAccess(
    studentId: string,
    classId: string,
    subjectId: string,
  ) {
    if (!Types.ObjectId.isValid(classId)) {
      return false;
    }

    const enrollments = await this.enrollmentModel
      .find({
        student_id: studentId,
        $or: [
          { course_id: new Types.ObjectId(classId) },
          { tuition_class_id: new Types.ObjectId(classId) },
        ],
        product_type: 'tuition',
        subscription_status: 'active',
      })
      .exec();

    console.log(`[TuitionAccess] student:${studentId} class:${classId} subject:${subjectId} found:${enrollments.length}`);
    const now = new Date();

    for (const en of enrollments) {
      if (en.billing_mode === 'monthly') {
        if (en.billing_period_end && en.billing_period_end < now) {
          continue;
        }
      }

      if (en.access_scope === 'class') {
        return true;
      }

      if (
        en.access_scope === 'subject' &&
        en.tuition_subject_id?.toString() === subjectId
      ) {
        return true;
      }
    }

    return false;
  }

  async isActiveCourseEnrollment(
    courseId: string,
    studentId: string,
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(courseId)) return false;

    const enrollment = await this.enrollmentModel
      .findOne({
        course_id: new Types.ObjectId(courseId),
        student_id: studentId,
        product_type: 'course',
        status: 'active',
      })
      .select('_id status access_expires')
      .exec();

    if (!enrollment) return false;
    if (enrollment.access_expires && enrollment.access_expires < new Date())
      return false;
    return true;
  }

  async listActiveCourseIdsForStudent(studentId: string): Promise<string[]> {
    const now = new Date();
    const enrollments = await this.enrollmentModel
      .find({
        student_id: studentId,
        $or: [
          {
            product_type: 'course',
            status: 'active',
            $or: [
              { access_expires: null },
              { access_expires: { $exists: false } },
              { access_expires: { $gte: now } },
            ],
          },
          {
            product_type: 'tuition',
            subscription_status: 'active',
            $or: [
              { billing_mode: 'bundle' },
              {
                billing_mode: 'monthly',
                billing_period_end: { $gte: now },
              },
            ],
          },
        ],
      })
      .select('course_id')
      .lean()
      .exec();

    return [...new Set(enrollments.map((e) => e.course_id.toString()))];
  }

  /**
   * Returns an array of filter objects representing the student's active access.
   * Handles both Course (full access) and Tuition (class or subject level access).
   */
  async getStudentAccessFilters(studentId: string): Promise<any[]> {
    const now = new Date();
    const enrollments = await this.enrollmentModel
      .find({
        student_id: studentId,
        $or: [
          {
            product_type: 'course',
            status: 'active',
            $or: [
              { access_expires: null },
              { access_expires: { $exists: false } },
              { access_expires: { $gte: now } },
            ],
          },
          {
            product_type: 'tuition',
            subscription_status: 'active',
            $or: [
              { billing_mode: 'bundle' },
              {
                billing_mode: 'monthly',
                billing_period_end: { $gte: now },
              },
            ],
          },
        ],
      })
      .select('course_id product_type access_scope tuition_subject_id')
      .lean()
      .exec();

    const filters: any[] = [];
    for (const enr of enrollments) {
      if (enr.product_type === 'course') {
        filters.push({ course_id: enr.course_id });
      } else if (enr.product_type === 'tuition') {
        if (enr.access_scope === 'class') {
          filters.push({ course_id: enr.course_id });
        } else if (enr.access_scope === 'subject' && enr.tuition_subject_id) {
          filters.push({
            course_id: enr.course_id,
            subject_id: enr.tuition_subject_id,
          });
        }
      }
    }

    return filters;
  }

  async hasAccess(
    studentId: string,
    courseId: string,
    productType: 'course' | 'tuition',
    subjectId?: string,
  ): Promise<boolean> {
    if (productType === 'tuition') {
      return this.hasTuitionAccess(studentId, courseId, subjectId || '');
    }
    return this.isActiveCourseEnrollment(courseId, studentId);
  }
}
