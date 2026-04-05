import { IsString, IsOptional, IsEmail, MaxLength, IsArray, IsNumber } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  // Teacher specific
  @IsString()
  @IsOptional()
  @MaxLength(200)
  headline?: string;

  @IsArray()
  @IsOptional()
  expertise?: string[];

  @IsString()
  @IsOptional()
  qualifications?: string;

  @IsNumber()
  @IsOptional()
  yearsExperience?: number;

  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  // Student specific
  @IsString()
  @IsOptional()
  @MaxLength(50)
  educationLevel?: string;

  @IsArray()
  @IsOptional()
  interests?: string[];

  @IsString()
  @IsOptional()
  learningGoals?: string;
}
