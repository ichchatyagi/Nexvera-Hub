import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsMongoId,
  IsPositive,
  IsIn,
  Min,
} from 'class-validator';

// ─── Upload Initiation ────────────────────────────────────────────────────────

/**
 * Body for POST /videos/upload-url
 *
 * The teacher provides metadata about the file they are about to upload so the
 * backend can:
 *   1. Mint a presigned S3 PUT URL with the correct Content-Type.
 *   2. Create a placeholder Video document (status = 'pending').
 */
export class InitiateUploadDto {
  /** MongoDB ObjectId of the course this video belongs to. */
  @IsMongoId()
  @IsNotEmpty()
  course_id: string;

  /**
   * MongoDB ObjectId of the lesson that will embed this video.
   * Optional at upload time – teacher may link the lesson after upload.
   */
  @IsMongoId()
  @IsOptional()
  lesson_id?: string;

  /**
   * Original file name as chosen by the teacher (e.g. "lecture-01.mp4").
   * Used to derive the S3 key suffix and stored for human readability.
   */
  @IsString()
  @IsNotEmpty()
  filename: string;

  /** MIME type of the file, e.g. "video/mp4", "video/quicktime". */
  @IsString()
  @IsNotEmpty()
  mime_type: string;

  /** File size in bytes – stored in `original.size_bytes`. */
  @IsNumber()
  @IsPositive()
  size_bytes: number;

  /**
   * Known duration in seconds, if the client can determine it before upload.
   * Defaults to 0 and will be updated by MediaConvert during processing.
   */
  @IsNumber()
  @Min(0)
  @IsOptional()
  duration_seconds?: number;
}

// ─── Processing trigger ───────────────────────────────────────────────────────

/**
 * (Optional) body for POST /videos/:id/process
 * Currently unused – the endpoint derives everything from the stored document –
 * but kept here for future admin overrides (e.g. force a specific quality set).
 */
export class TriggerProcessingDto {
  /** Override the quality ladder for this specific job. */
  @IsOptional()
  qualities?: Array<'360p' | '480p' | '720p' | '1080p'>;
}

// ─── Caption upload ───────────────────────────────────────────────────────────

export class AddCaptionDto {
  /** BCP-47 language tag, e.g. "en", "hi". */
  @IsString()
  @IsNotEmpty()
  language: string;

  /** Direct URL to image or signed CloudFront URL of the caption file. */
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  auto_generated?: boolean;
}

// ─── Processing completion callback ──────────────────────────────────────────

/**
 * Body for POST /videos/:id/processing-complete
 *
 * This DTO is intentionally minimal: the worker only needs to tell us the
 * base S3 key prefix and the final duration. The API then builds the full
 * HLS URL set using the standard quality ladder.
 */
export class CompleteProcessingDto {
  /**
   * Base S3 key prefix for the processed outputs, e.g.:
   *  "videos/<videoId>"
   * The service will derive:
   *  - master.m3u8 at <base>/master.m3u8
   *  - renditions at <base>/<resolution>/index.m3u8
   */
  @IsString()
  @IsNotEmpty()
  base_key: string;

  /**
   * Final video duration in seconds, as reported by MediaConvert.
   * Optional – if omitted, existing duration_seconds is preserved.
   */
  @IsNumber()
  @Min(0)
  @IsOptional()
  duration_seconds?: number;

  /**
   * Optional processing status override:
   *  - "completed" (default) → happy path
   *  - "failed"              → mark job as failed
   */
  @IsString()
  @IsIn(['completed', 'failed'])
  status: 'completed' | 'failed';

  /**
   * Optional error message or code if status is "failed".
   */
  @IsString()
  @IsOptional()
  error?: string;
}
