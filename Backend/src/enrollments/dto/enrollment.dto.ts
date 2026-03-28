import { IsNumber, IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateProgressDto {
  @IsNumber()
  @IsOptional()
  percentage?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  completedLessons?: string[];

  // Keep compatibility or support both? Requirements say completedLessons
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  completed_lessons?: string[];

  @IsString()
  @IsOptional()
  currentLessonId?: string;

  @IsString()
  @IsOptional()
  current_lesson?: string;

  @IsNumber()
  @IsOptional()
  lastPositionSeconds?: number;

  @IsString()
  @IsOptional()
  videoId?: string;
}
