import { IsNumber, IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateProgressDto {
  @IsNumber()
  @IsOptional()
  percentage?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  completed_lessons?: string[];

  @IsString()
  @IsOptional()
  current_lesson?: string;
}
