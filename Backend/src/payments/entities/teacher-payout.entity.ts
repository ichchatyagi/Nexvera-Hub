import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum PayoutStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('teacher_payouts')
export class TeacherPayout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'teacher_id', type: 'uuid' })
  teacherId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'INR' })
  currency: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: PayoutStatus,
    default: PayoutStatus.PENDING,
  })
  status: PayoutStatus;

  @Column({ name: 'razorpay_payout_id', type: 'varchar', length: 255, nullable: true })
  razorpayPayoutId: string;

  @Column({ name: 'payout_period_start', type: 'date', nullable: true })
  payoutPeriodStart: Date;

  @Column({ name: 'payout_period_end', type: 'date', nullable: true })
  payoutPeriodEnd: Date;

  @Column({ name: 'processed_at', type: 'timestamp with time zone', nullable: true })
  processedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
