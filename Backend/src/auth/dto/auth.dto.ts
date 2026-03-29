import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsIn,
  MinLength,
  IsOptional,
} from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  /** Only 'student' or 'teacher' are allowed; admin/moderator cannot self-register. */
  @IsIn([UserRole.STUDENT, UserRole.TEACHER])
  @IsOptional()
  role?: UserRole.STUDENT | UserRole.TEACHER;

  @IsString()
  @IsOptional()
  name?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  idToken: string; // Google ID token from the client
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
