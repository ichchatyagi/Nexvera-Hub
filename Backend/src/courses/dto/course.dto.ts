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
  ValidateIf,
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

export enum ProductType {
  COURSE = 'course',
  TUITION = 'tuition',
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

export class TuitionPricingDto {
  @IsOptional()
  monthly_enabled?: boolean;

  @IsNumber()
  @IsOptional()
  monthly_price?: number;

  @IsOptional()
  bundle_enabled?: boolean;

  @IsNumber()
  @IsOptional()
  bundle_price?: number;

  @IsString()
  @IsOptional()
  currency?: string;
}

export class TuitionSubjectDto {
  @IsString()
  @IsOptional()
  subject_id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  short_description?: string;

  @IsIn(['draft', 'published', 'archived'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  lead_instructor_id?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assigned_instructor_ids?: string[];

  @ValidateNested()
  @Type(() => TuitionPricingDto)
  @IsOptional()
  pricing?: TuitionPricingDto;

  @IsArray()
  @IsOptional()
  syllabus?: any[];

  @IsNumber()
  @IsOptional()
  total_lessons?: number;

  @IsNumber()
  @IsOptional()
  total_duration_hours?: number;
}

export class TuitionMetaDto {
  @IsNumber()
  @Min(5)
  @Max(12)
  @IsNotEmpty()
  class_level: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  boards_supported?: string[];

  @ValidateNested()
  @Type(() => TuitionPricingDto)
  @IsOptional()
  pricing?: TuitionPricingDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TuitionSubjectDto)
  @IsOptional()
  subjects?: TuitionSubjectDto[];
}

// ----------------------------- Create / Update -----------------------------
export class CreateCourseDto {
  @IsIn(Object.values(ProductType))
  @IsOptional()
  product_type?: ProductType;

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

  @ValidateIf((o) => o.product_type !== ProductType.TUITION)
  @ValidateNested()
  @Type(() => CourseCategoryDto)
  @IsNotEmpty()
  category?: CourseCategoryDto;

  @ValidateNested()
  @Type(() => TuitionMetaDto)
  @IsOptional()
  tuition_meta?: TuitionMetaDto;

  @ValidateIf((o) => o.product_type !== ProductType.TUITION)
  @ValidateNested()
  @Type(() => CoursePricingDto)
  @IsNotEmpty()
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
}

export class UpdateCourseDto {
  @IsIn(Object.values(ProductType))
  @IsOptional()
  product_type?: ProductType;

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
  @Type(() => TuitionMetaDto)
  @IsOptional()
  tuition_meta?: TuitionMetaDto;

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
