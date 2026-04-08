import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsIn,
  IsArray
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { TuitionPricingDto, CourseLevel } from './course.dto';

export class AdminCreateTuitionClassDto {
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
  language?: string;

  @IsString()
  @IsOptional()
  thumbnail_url?: string;

  @IsIn(Object.values(CourseLevel))
  @Transform(({ value }) => value?.toLowerCase())
  @IsOptional()
  level?: CourseLevel;

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
  tuition_pricing?: TuitionPricingDto;
}

export class AdminUpdateTuitionClassDto {
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
  language?: string;

  @IsString()
  @IsOptional()
  thumbnail_url?: string;

  @IsIn(Object.values(CourseLevel))
  @Transform(({ value }) => value?.toLowerCase())
  @IsOptional()
  level?: CourseLevel;

  @IsNumber()
  @Min(5)
  @Max(12)
  @IsOptional()
  class_level?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  boards_supported?: string[];

  @ValidateNested()
  @Type(() => TuitionPricingDto)
  @IsOptional()
  tuition_pricing?: TuitionPricingDto;
}

export class AdminCreateTuitionSubjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  short_description?: string;

  @ValidateNested()
  @Type(() => TuitionPricingDto)
  @IsOptional()
  pricing?: TuitionPricingDto;
}

export class AdminUpdateTuitionSubjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  short_description?: string;

  @ValidateNested()
  @Type(() => TuitionPricingDto)
  @IsOptional()
  pricing?: TuitionPricingDto;
}

export class AdminTuitionPublishDto {
  @IsIn(['draft', 'pending_review', 'published', 'archived'])
  @IsNotEmpty()
  status: string;
}

export class AdminAssignTuitionInstructorDto {
  @IsString()
  @IsNotEmpty()
  instructor_id: string;

  @IsBoolean()
  @IsOptional()
  is_lead?: boolean;
}
