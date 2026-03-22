import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('teacher_profiles')
export class TeacherProfile {
  @PrimaryColumn('uuid')
  user_id: string;

  @OneToOne(() => User, (user) => user.teacherProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 200, nullable: true })
  headline: string;

  @Column({ type: 'text', array: true, nullable: true })
  expertise: string[];

  @Column({ type: 'jsonb', nullable: true })
  qualifications: any;

  @Column({ name: 'years_experience', type: 'integer', nullable: true })
  yearsExperience: number;

  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'total_students', type: 'integer', default: 0 })
  totalStudents: number;

  @Column({ name: 'total_courses', type: 'integer', default: 0 })
  totalCourses: number;

  @Column({ name: 'average_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ name: 'total_reviews', type: 'integer', default: 0 })
  totalReviews: number;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({ name: 'payout_method', type: 'jsonb', nullable: true })
  payoutMethod: any;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
