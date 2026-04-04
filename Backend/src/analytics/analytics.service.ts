import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Repository, MoreThanOrEqual, MoreThan } from 'typeorm';
import { Model, Types } from 'mongoose';
import { User, UserRole } from '../users/entities/user.entity';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { Enrollment, EnrollmentDocument } from '../enrollments/schemas/enrollment.schema';
import { Transaction, TransactionStatus } from '../payments/entities/transaction.entity';
import { LiveClass, LiveClassDocument, LiveClassStatus } from '../live-classes/schemas/live-class.schema';

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
  ) {}

  async getOverview() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // 1. Users
    const total_users = await this.userRepository.count();
    const total_students = await this.userRepository.count({ where: { role: UserRole.STUDENT } });
    const total_teachers = await this.userRepository.count({ where: { role: UserRole.TEACHER } });
    
    // Active students in 30 days: ANY action (enrollment, transaction, attendance, or registration)
    // We collect IDs in a Set for uniqueness
    const activeStudentIds = new Set<string>();

    const recentEnrollments = await this.enrollmentModel.find({ 
      enrolled_at: { $gte: thirtyDaysAgo } 
    }).select('student_id').lean();
    recentEnrollments.forEach(e => activeStudentIds.add(e.student_id));

    const recentTransactions = await this.transactionRepository.find({
      select: ['userId'],
      where: { 
        status: TransactionStatus.COMPLETED,
        createdAt: MoreThanOrEqual(thirtyDaysAgo) 
      }
    });
    recentTransactions.forEach(t => activeStudentIds.add(t.userId));

    const recentClassAttendance = await this.liveClassModel.find({
      actual_start: { $gte: thirtyDaysAgo }
    }).select('attended_students').lean();
    recentClassAttendance.forEach(lc => lc.attended_students.forEach(id => activeStudentIds.add(id)));

    const newStudents = await this.userRepository.find({
      select: ['id'],
      where: {
        role: UserRole.STUDENT,
        createdAt: MoreThanOrEqual(thirtyDaysAgo)
      }
    });
    newStudents.forEach(u => activeStudentIds.add(u.id));

    const active_students_30d = activeStudentIds.size;

    // 2. Catalog
    const total_courses = await this.courseModel.countDocuments();
    const published_courses = await this.courseModel.countDocuments({ status: 'published' });

    // 3. Enrollments
    const total_enrollments = await this.enrollmentModel.countDocuments();
    const active_enrollments = await this.enrollmentModel.countDocuments({ status: 'active' });

    // 4. Revenue (amounts in paisa converted to INR)
    const allTimeTx = await this.transactionRepository.find({ 
      where: { status: TransactionStatus.COMPLETED } 
    });
    const revenue_all_time = allTimeTx.reduce((sum, tx) => sum + Number(tx.amount || 0), 0) / 100;

    const last30dTx = await this.transactionRepository.find({
      where: { 
        status: TransactionStatus.COMPLETED,
        createdAt: MoreThanOrEqual(thirtyDaysAgo)
      }
    });
    const revenue_last_30d = last30dTx.reduce((sum, tx) => sum + Number(tx.amount || 0), 0) / 100;

    const mtdTx = await this.transactionRepository.find({
      where: { 
        status: TransactionStatus.COMPLETED,
        createdAt: MoreThanOrEqual(startOfMonth)
      }
    });
    const revenue_mtd = mtdTx.reduce((sum, tx) => sum + Number(tx.amount || 0), 0) / 100;

    // 5. Live Classes
    const live_classes_scheduled_today = await this.liveClassModel.countDocuments({
      status: LiveClassStatus.SCHEDULED,
      scheduled_start: { $gte: startOfToday, $lte: endOfToday }
    });

    const live_classes_live_now = await this.liveClassModel.countDocuments({
      status: LiveClassStatus.LIVE
    });

    const live_classes_completed_7d = await this.liveClassModel.countDocuments({
      status: LiveClassStatus.ENDED,
      actual_end: { $gte: sevenDaysAgo }
    });

    return {
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
      },
      live_classes: {
        live_classes_scheduled_today,
        live_classes_live_now,
        live_classes_completed_7d,
      }
    };
  }
}
