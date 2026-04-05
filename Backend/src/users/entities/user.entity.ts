import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  googleId: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: UserRole.STUDENT,
    enum: UserRole,
  })
  role: UserRole;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  resetOtp: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetOtpExpiresAt: Date | null;

  @Column({ type: 'varchar', length: 5, nullable: true })
  verificationOtp: string | null;

  @Column({ type: 'timestamp', nullable: true })
  verificationOtpExpiresAt: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  timezone: string;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  avatarUrl: string;

  // Teacher Specific
  @Column({ type: 'varchar', length: 200, nullable: true })
  headline: string;

  @Column({ type: 'simple-array', nullable: true })
  expertise: string[];

  @Column({ type: 'text', nullable: true })
  qualifications: string;

  @Column({ type: 'int', default: 0 })
  yearsExperience: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  hourlyRate: number;

  // Student Specific
  @Column({ type: 'varchar', length: 50, nullable: true })
  educationLevel: string;

  @Column({ type: 'simple-array', nullable: true })
  interests: string[];

  @Column({ type: 'text', nullable: true })
  learningGoals: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
