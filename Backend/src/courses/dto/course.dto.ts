import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsOptional,
  IsNumber,
  Min,
  Max,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// ----------------------------- Enums as strings ----------------------------
export enum CoursePricingType {
  FREE = 'free',
  PAID = 'paid',
  SUBSCRIPTION = 'subscription',
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum CourseStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// ----------------------------- Sub-DTOs ------------------------------------
export class CourseCategoryDto {
  @IsString()
  @IsNotEmpty()
  main: string;

  @IsString()
  @IsNotEmpty()
  sub: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class CoursePricingDto {
  @IsIn(Object.values(CoursePricingType))
  @IsOptional()
  type?: CoursePricingType;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;
}

export class AssignInstructorDto {
  @IsString()
  @IsNotEmpty()
  instructor_id: string;

  @IsOptional()
  is_lead?: boolean;
}

// ----------------------------- Create / Update -----------------------------
export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  short_description?: string;

  @IsString()
  @IsOptional()
  lead_instructor_id?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assigned_instructor_ids?: string[];

  @ValidateNested()
  @Type(() => CourseCategoryDto)
  @IsNotEmpty()
  category: CourseCategoryDto;

  @ValidateNested()
  @Type(() => CoursePricingDto)
  @IsNotEmpty()
  pricing: CoursePricingDto;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  thumbnail_url?: string;

  @IsIn(Object.values(CourseLevel))
  @Transform(({ value }) => value?.toLowerCase())
  @IsOptional()
  level?: CourseLevel;
}

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  short_description?: string;

  @IsString()
  @IsOptional()
  lead_instructor_id?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assigned_instructor_ids?: string[];

  @ValidateNested()
  @Type(() => CourseCategoryDto)
  @IsOptional()
  category?: CourseCategoryDto;

  @ValidateNested()
  @Type(() => CoursePricingDto)
  @IsOptional()
  pricing?: CoursePricingDto;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  thumbnail_url?: string;

  @IsIn(Object.values(CourseLevel))
  @Transform(({ value }) => value?.toLowerCase())
  @IsOptional()
  level?: CourseLevel;

  @IsIn(Object.values(CourseStatus))
  @IsOptional()
  status?: CourseStatus;

  /** Allow sending the full serialised curriculum for update */
  @IsArray()
  @IsOptional()
  curriculum?: any[];
}

// ----------------------------- Review --------------------------------------
export class CreateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsOptional()
  review_text?: string;
}
