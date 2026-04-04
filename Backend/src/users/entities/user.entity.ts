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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
