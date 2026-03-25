import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsDateString,
  IsInt,
  IsBoolean,
  IsPositive,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── Nested: Feature flags ────────────────────────────────────────────────────

export class CreateFeaturesDto {
  @IsBoolean()
  @IsOptional()
  chat_enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  qa_enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  screen_share_enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  whiteboard_enabled?: boolean;
}

// ─── Nested: Recording config ─────────────────────────────────────────────────

export class CreateRecordingDto {
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

// ─── POST /live-classes ───────────────────────────────────────────────────────

/**
 * Body for creating a new live class.
 * The teacher provides scheduling, course link, and optional feature flags.
 */
export class CreateLiveClassDto {
  /** MongoDB ObjectId of the course this session belongs to. */
  @IsMongoId()
  @IsNotEmpty()
  course_id: string;

  /**
   * MongoDB ObjectId of the lesson this session maps to.
   * Optional – can be linked after creation.
   */
  @IsMongoId()
  @IsOptional()
  lesson_id?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  /**
   * ISO-8601 datetime string for the scheduled start (UTC recommended).
   * Example: "2026-04-01T14:00:00.000Z"
   */
  @IsDateString()
  scheduled_start: string;

  /**
   * ISO-8601 datetime string for the scheduled end.
   * Must be after scheduled_start (enforced in service).
   */
  @IsDateString()
  scheduled_end: string;

  /**
   * IANA timezone identifier for the teacher's local display.
   * Example: "Asia/Kolkata", "America/New_York"
   */
  @IsString()
  @IsNotEmpty()
  timezone: string;

  /** Hard upper limit on registered students (1–1000). */
  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(1000)
  @IsOptional()
  max_participants?: number;

  @ValidateNested()
  @Type(() => CreateFeaturesDto)
  @IsOptional()
  features?: CreateFeaturesDto;

  @ValidateNested()
  @Type(() => CreateRecordingDto)
  @IsOptional()
  recording?: CreateRecordingDto;
}

// ─── PUT /live-classes/:id ────────────────────────────────────────────────────

/**
 * All fields optional – only fields present in the request body are applied.
 * Updates are only permitted while status === 'scheduled'.
 */
export class UpdateLiveClassDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  scheduled_start?: string;

  @IsDateString()
  @IsOptional()
  scheduled_end?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  timezone?: string;

  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(1000)
  @IsOptional()
  max_participants?: number;

  @ValidateNested()
  @Type(() => CreateFeaturesDto)
  @IsOptional()
  features?: CreateFeaturesDto;

  @ValidateNested()
  @Type(() => CreateRecordingDto)
  @IsOptional()
  recording?: CreateRecordingDto;
}
