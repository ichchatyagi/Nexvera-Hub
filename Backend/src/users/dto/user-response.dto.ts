import { User, UserRole } from '../entities/user.entity';

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export function mapUserToResponse(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    // passwordHash and googleId are deliberately excluded
  };
}
