import { User } from '../entities/user.entity';

export class UserResponseDto {
  id: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
  profile?: any;
  teacherProfile?: any;
  studentProfile?: any;
  createdAt: Date;
  updatedAt: Date;
}

export function mapUserToResponse(user: User): UserResponseDto {
  if (!user) return null as any;
  
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    profile: user.profile,
    teacherProfile: user.teacherProfile,
    studentProfile: user.studentProfile,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
