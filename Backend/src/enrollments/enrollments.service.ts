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

  async enroll(courseId: string, studentId: string, transactionId?: string) {
    if (!Types.ObjectId.isValid(courseId)) throw new NotFoundException('Invalid Course ID');
    
    // In a full implementation, we would check if the course exists and handle payment
    // For now, assume successful free enrollment
    
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
}
