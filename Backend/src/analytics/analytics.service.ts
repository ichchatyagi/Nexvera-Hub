import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Repository, MoreThanOrEqual, MoreThan } from 'typeorm';
import { Model, Types } from 'mongoose';
import { User, UserRole } from '../users/entities/user.entity';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import {
  Enrollment,
  EnrollmentDocument,
} from '../enrollments/schemas/enrollment.schema';
import {
  Transaction,
  TransactionStatus,
} from '../payments/entities/transaction.entity';
import {
  LiveClass,
  LiveClassDocument,
  LiveClassStatus,
} from '../live-classes/schemas/live-class.schema';

import { CacheService } from '../cache/cache.service';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectModel(LiveClass.name)
    private readonly liveClassModel: Model<LiveClassDocument>,
    private readonly cacheService: CacheService,
  ) {}

  async getOverview() {
    return this.cacheService.getOrSetJson(
      'admin-analytics',
      'overview',
      60,
      () => this.getOverviewImplementation(),
    );
  }

  private async getOverviewImplementation() {
    try {
      const now = new Date();
      // Use UTC for consistent date boundaries regardless of server timezone
      const thirtyDaysAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30));
      const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

      // 1. Users
      const [total_users, total_students, total_teachers] = await Promise.all([
        this.userRepository.count(),
        this.userRepository.count({ where: { role: UserRole.STUDENT } }),
        this.userRepository.count({ where: { role: UserRole.TEACHER } }),
      ]);

      // Active students in 30 days: ANY action (enrollment, transaction, attendance, or registration)
      const activeStudentIds = new Set<string>();

      const recentEnrollments = await this.enrollmentModel
        .find({ enrolled_at: { $gte: thirtyDaysAgo } })
        .select('student_id')
        .lean();
      recentEnrollments.forEach((e) => activeStudentIds.add(e.student_id));

      const recentTransactions = await this.transactionRepository.find({
        select: ['userId'],
        where: {
          status: TransactionStatus.COMPLETED,
          createdAt: MoreThanOrEqual(thirtyDaysAgo),
        },
      });
      recentTransactions.forEach((t) => activeStudentIds.add(t.userId));

      const recentClassAttendance = await this.liveClassModel
        .find({ actual_start: { $gte: thirtyDaysAgo } })
        .select('attended_students')
        .lean();
      recentClassAttendance.forEach((lc) =>
        lc.attended_students.forEach((id) => activeStudentIds.add(id)),
      );

      const newStudents = await this.userRepository.find({
        select: ['id'],
        where: {
          role: UserRole.STUDENT,
          createdAt: MoreThanOrEqual(thirtyDaysAgo),
        },
      });
      newStudents.forEach((u) => activeStudentIds.add(u.id));

      const active_students_30d = activeStudentIds.size;

      // 2. Catalog
      const [total_courses, published_courses] = await Promise.all([
        this.courseModel.countDocuments(),
        this.courseModel.countDocuments({ status: 'published' }),
      ]);

      // 3. Enrollments
      const [total_enrollments, active_enrollments] = await Promise.all([
        this.enrollmentModel.countDocuments(),
        this.enrollmentModel.countDocuments({ status: 'active' }),
      ]);

      // 4. Revenue (stored in major units decimal(12,2))
      const allTimeTx = await this.transactionRepository.find({
        where: { status: TransactionStatus.COMPLETED },
      });
      const revenue_all_time = allTimeTx.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
      
      // Multi-currency breakdown
      const currency_breakdown: Record<string, number> = {};
      allTimeTx.forEach(tx => {
        const cur = tx.currency || 'INR';
        currency_breakdown[cur] = (currency_breakdown[cur] || 0) + Number(tx.amount || 0);
      });

      const last30dTx = await this.transactionRepository.find({
        where: {
          status: TransactionStatus.COMPLETED,
          createdAt: MoreThanOrEqual(thirtyDaysAgo),
        },
      });
      const revenue_last_30d = last30dTx.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

      const mtdTx = await this.transactionRepository.find({
        where: {
          status: TransactionStatus.COMPLETED,
          createdAt: MoreThanOrEqual(startOfMonth),
        },
      });
      const revenue_mtd = mtdTx.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

      // 5. Live Classes
      const [live_classes_scheduled_today, live_classes_live_now, live_classes_completed_7d] = await Promise.all([
        this.liveClassModel.countDocuments({
          status: LiveClassStatus.SCHEDULED,
          scheduled_start: { $gte: startOfToday, $lte: endOfToday },
        }),
        this.liveClassModel.countDocuments({ status: LiveClassStatus.LIVE }),
        this.liveClassModel.countDocuments({
          status: LiveClassStatus.ENDED,
          actual_end: { $gte: sevenDaysAgo },
        }),
      ]);

      return {
        success: true,
        data: {
          users: {
            total_users,
            total_students,
            total_teachers,
            active_students_30d,
          },
          catalog: {
            total_courses,
            published_courses,
          },
          learning: {
            total_enrollments,
            active_enrollments,
          },
          revenue: {
            revenue_all_time,
            revenue_last_30d,
            revenue_mtd,
            currency_breakdown,
          },
          live_classes: {
            live_classes_scheduled_today,
            live_classes_live_now,
            live_classes_completed_7d,
          },
        }
      };
    } catch (err) {
      return {
        success: false,
        error: 'Failed to aggregate overview metrics',
        message: err.message,
      };
    }
  }
}
