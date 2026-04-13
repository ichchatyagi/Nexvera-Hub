import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Enrollment, EnrollmentDocument } from './schemas/enrollment.schema';
import { UpdateProgressDto } from './dto/enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
  ) {}

  async enroll(courseId: string, studentId: string, metadata?: any) {
    if (!Types.ObjectId.isValid(courseId)) throw new NotFoundException('Invalid Course ID');
    
    const isTuition = metadata?.product_type === 'tuition';
    
    const filter: any = {
      course_id: new Types.ObjectId(courseId),
      student_id: studentId,
      product_type: isTuition ? 'tuition' : 'course'
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
        enrollmentData.tuition_subject_id = new Types.ObjectId(metadata.subjectId);
      }

      if (metadata.billing_mode === 'monthly') {
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 30);
        enrollmentData.billing_period_start = start;
        enrollmentData.billing_period_end = end;
      }
    }

    if (existing) {
      Object.assign(existing, enrollmentData);
      await existing.save();
      return { success: true, data: existing };
    }

    const enrollment = await this.enrollmentModel.create(enrollmentData);
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

  async updateProgress(courseId: string, studentId: string, dto: UpdateProgressDto) {
    if (!Types.ObjectId.isValid(courseId)) throw new NotFoundException('Invalid Course ID');

    const enrollment = await this.enrollmentModel.findOne({
      course_id: new Types.ObjectId(courseId),
      student_id: studentId,
    }).exec();

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (typeof dto.percentage === 'number') {
      enrollment.progress.percentage = dto.percentage;
    }
    
    if (dto.current_lesson) {
        if (!Types.ObjectId.isValid(dto.current_lesson)) throw new NotFoundException('Invalid lesson ID');
        enrollment.progress.current_lesson = new Types.ObjectId(dto.current_lesson);
    }

    if (dto.completed_lessons) {
      const ObjectIds = dto.completed_lessons.map(id => {
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

    enrollment.progress.last_accessed = new Date();
    await enrollment.save();

    return { success: true, data: enrollment };
  }

  async findByCourse(courseId: string) {
    if (!Types.ObjectId.isValid(courseId)) throw new NotFoundException('Invalid Course ID');
    return this.enrollmentModel.find({ course_id: new Types.ObjectId(courseId) }).exec();
  }

  async findByStudent(studentId: string) {
    return this.enrollmentModel.find({ student_id: studentId }).exec();
  }

  async hasTuitionAccess(studentId: string, classId: string, subjectId: string) {
    if (!Types.ObjectId.isValid(classId) || !Types.ObjectId.isValid(subjectId)) {
      return false;
    }

    const enrollments = await this.enrollmentModel.find({
      student_id: studentId,
      tuition_class_id: new Types.ObjectId(classId),
      product_type: 'tuition',
      subscription_status: 'active',
    }).exec();

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

      if (en.access_scope === 'subject' && en.tuition_subject_id?.toString() === subjectId) {
         return true;
      }
    }

    return false;
  }
}
