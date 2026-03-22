import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('student_profiles')
export class StudentProfile {
  @PrimaryColumn('uuid')
  user_id: string;

  @OneToOne(() => User, (user) => user.studentProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'education_level', type: 'varchar', length: 50, nullable: true })
  educationLevel: string;

  @Column({ type: 'text', array: true, nullable: true })
  interests: string[];

  @Column({ name: 'learning_goals', type: 'text', nullable: true })
  learningGoals: string;

  @Column({ name: 'total_courses_enrolled', type: 'integer', default: 0 })
  totalCoursesEnrolled: number;

  @Column({ name: 'total_certificates', type: 'integer', default: 0 })
  totalCertificates: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
