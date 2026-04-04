import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsIn,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum LessonType {
  VIDEO = 'video',
  LIVE_CLASS = 'live_class',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  RESOURCE = 'resource',
}

export class LessonContentDto {
  @IsString()
  @IsOptional()
  video_id?: string;

  @IsString()
  @IsOptional()
  live_class_id?: string;

  @IsString()
  @IsOptional()
  quiz_id?: string;

  @IsString()
  @IsOptional()
  resource_url?: string;
}

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsIn(Object.values(LessonType))
  type: LessonType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  duration_minutes?: number;

  @IsOptional()
  is_preview?: boolean;

  @ValidateNested()
  @Type(() => LessonContentDto)
  @IsOptional()
  content?: LessonContentDto;
}

export class UpdateLessonDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsIn(Object.values(LessonType))
  @IsOptional()
  type?: LessonType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  duration_minutes?: number;

  @IsOptional()
  is_preview?: boolean;

  @ValidateNested()
  @Type(() => LessonContentDto)
  @IsOptional()
  content?: LessonContentDto;
}

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
}

export class UpdateSectionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
}
