import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TeacherPayout } from '../entities/payout.entity';
import { Course, CourseDocument } from '../../courses/schemas/course.schema';

@Injectable()
export class PayoutsService {
  constructor(
    @InjectRepository(TeacherPayout)
    private readonly payoutRepository: Repository<TeacherPayout>,
    @InjectModel(Course.name) private readonly courseModel: Model<CourseDocument>,
  ) {}

  /**
   * Calculates current earnings for an instructor based on assigned Nexvera courses.
   * NOTE: For Nexvera-owned courses, instructors are compensated based on their teaching
   * assignments (lead or supporting) rather than course ownership.
   * 
   * CRITICAL: This is an internal estimate for reporting and does not guarantee
   * payout until the transaction is validated and finalized by the automated payout job.
   */
  async calculateEarnings(teacherId: string) {
    // 1. Find all Nexvera-owned courses where the teacher is assigned as lead or session instructor
    const assignedCourses = await this.courseModel.find({
      $or: [
        { lead_instructor_id: teacherId },
        { assigned_instructor_ids: teacherId },
      ],
      status: 'published',
    }).exec();

    let totalPending = 0;
    const breakdown: any[] = [];

    // Earnings calculation logic: $15 per student enrolled in their assigned segments
    for (const course of assignedCourses) {
      const enrollmentCount = course.stats?.enrollments || 0;
      const earningsForThisCourse = enrollmentCount * 15; 
      
      totalPending += earningsForThisCourse;
      breakdown.push({
        courseId: course._id,
        courseTitle: course.title,
        students: enrollmentCount,
        amount: earningsForThisCourse,
        basis: 'enrollment_based_assignment',
        currency: 'USD',
      });
    }

    return {
      teacherId,
      totalPending,
      currency: 'USD',
      breakdown,
    };
  }

  /**
   * Note: Actual payout execution (via Razorpay Payouts or other providers) 
   * is currently deferred and will be implemented as a separate module.
   */
}
