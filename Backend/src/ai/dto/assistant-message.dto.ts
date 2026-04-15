import { IsString, IsOptional } from 'class-validator';

export class AssistantMessageDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  courseIdOrSlug?: string;

  @IsOptional()
  @IsString()
  lessonId?: string;
}
