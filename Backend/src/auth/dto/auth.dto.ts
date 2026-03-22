import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsIn } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsIn([UserRole.STUDENT, UserRole.TEACHER], { message: 'role must be either student or teacher' })
  role?: UserRole;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class GoogleLoginDto {
  // In a real flow, this could be ID token verified via google-auth-library
  @IsString()
  googleId: string;

  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}
