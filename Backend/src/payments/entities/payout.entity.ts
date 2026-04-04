import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PayoutStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

/**
 * Payout for an assigned Nexvera-owned course, session, or cohort. 
 * Teachers are compensated based on teaching assignments (e.g., as lead or supporting instructors),
 * not course ownership. Nexvera Hub manages the catalog centrally.
 */
@Entity('teacher_payouts')
export class TeacherPayout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 
   * UUID of the assigned instructor receiving the payout.
   */
  @Column({ type: 'uuid' })
  teacherId: string;

  /**
   * MongoDB Course _id of the assigned teaching segment. 
   * Represented as a string since the Course catalog resides in MongoDB.
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  courseId: string | null;

  /** Optional link to a specific session or cohort UUID. */
  @Column({ type: 'uuid', nullable: true })
  cohortId: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PayoutStatus,
    default: PayoutStatus.PENDING,
  })
  status: PayoutStatus;

  /** 
   * Generic provider payout reference (e.g., Stripe Transfer ID, Razorpay Payout ID, or bank ref).
   */
  @Column({ nullable: true })
  stripeTransferId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
      basis: 'enrollment' | 'lecture' | 'performance_bonus';
      units?: number;
      assigned_at?: Date;
      course_title?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
