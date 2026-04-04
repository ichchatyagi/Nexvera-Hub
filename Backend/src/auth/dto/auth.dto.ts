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
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  /** Only 'student' or 'teacher' are allowed; admin/moderator cannot self-register. */
  @IsIn([UserRole.STUDENT, UserRole.TEACHER])
  @IsOptional()
  role?: UserRole.STUDENT | UserRole.TEACHER;
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

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
