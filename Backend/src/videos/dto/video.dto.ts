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
