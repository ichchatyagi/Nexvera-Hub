import { User, UserRole } from '../entities/user.entity';

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  status: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  country?: string;
  timezone?: string;
  language?: string;
  phone?: string;
  avatarUrl?: string;
  headline?: string;
  expertise?: string[];
  qualifications?: string;
  yearsExperience?: number;
  hourlyRate?: number;
  educationLevel?: string;
  interests?: string[];
  learningGoals?: string;
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
    firstName: user.firstName,
    lastName: user.lastName,
    bio: user.bio,
    country: user.country,
    timezone: user.timezone,
    language: user.language,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    headline: user.headline,
    expertise: user.expertise,
    qualifications: user.qualifications,
    yearsExperience: user.yearsExperience,
    hourlyRate: user.hourlyRate ? Number(user.hourlyRate) : undefined,
    educationLevel: user.educationLevel,
    interests: user.interests,
    learningGoals: user.learningGoals,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    // passwordHash and googleId are deliberately excluded
  };
}
