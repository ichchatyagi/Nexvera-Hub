import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { TeacherProfile } from './teacher-profile.entity';
import { StudentProfile } from './student-profile.entity';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
  passwordHash: string;

  @Column({ name: 'google_id', type: 'varchar', length: 255, unique: true, nullable: true })
  googleId: string;

  @Column({ type: 'varchar', length: 20, enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Column({ type: 'varchar', length: 20, enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true, eager: true })
  profile: UserProfile;

  @OneToOne(() => TeacherProfile, (teacher) => teacher.user, { cascade: true, nullable: true })
  teacherProfile: TeacherProfile;

  @OneToOne(() => StudentProfile, (student) => student.user, { cascade: true, nullable: true })
  studentProfile: StudentProfile;
}
