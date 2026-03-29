import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { Video, VideoDocument } from './schemas/video.schema';
import { InitiateUploadDto, AddCaptionDto } from './dto/video.dto';
import { AppConfigService } from '../app-config/app-config.service';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape of the presigned-URL response returned to the teacher client. */
export interface PresignedUploadResponse {
  /** The URL the client must use for a direct HTTP PUT to S3. */
  upload_url: string;
  /** S3 object key that will be used – the client cannot choose this. */
  s3_key: string;
  /** HTTP method the client should use (always PUT for S3 presigned PUTs). */
  method: 'PUT';
  /** Headers the client must include in the PUT request. */
  headers: {
    'Content-Type': string;
  };
  /** ISO-8601 expiry of the presigned URL (15 minutes from generation). */
  expires_at: string;
}

export interface InitiateUploadResult {
  presigned: PresignedUploadResponse;
  video: VideoDocument;
}

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(
    @InjectModel(Video.name) private readonly videoModel: Model<VideoDocument>,
    private readonly appConfig: AppConfigService,
  ) {}

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Build a CloudFront URL for a given S3 key in the processed bucket. */
  private cdnUrl(s3Key: string): string {
    const domain = this.appConfig.cloudfrontVideoDomain;
    return domain
      ? `https://${domain}/${s3Key}`
      : `https://cdn.example.com/${s3Key}`;
  }

  /** Generate the S3 object key for a raw upload. */
  private buildOriginalKey(videoId: string, filename: string): string {
    const ext = filename.split('.').pop() || 'mp4';
    return `originals/${videoId}/original.${ext}`;
  }

  // ─── Upload initiation ────────────────────────────────────────────────────

  /**
   * Initiates a video upload by:
   *   1. Generating an S3 object key using the video's future Mongo _id.
   *   2. Creating a Video document with status = 'pending'.
   *   3. Returning a stubbed presigned PUT URL (real AWS SDK call goes here).
   *
   * @see IMPLEMENTATION_PLAN_PART3.md §7 – "Step 1: Upload"
   * Real integration: replace `buildStubPresignedUrl` with AWS SDK v3
   * `@aws-sdk/s3-request-presigner` → `getSignedUrl(s3Client, new PutObjectCommand(...))`
   */
  async initiateUpload(
    teacherId: string,
    dto: InitiateUploadDto,
  ): Promise<InitiateUploadResult> {
    const videoId = new Types.ObjectId();
    const s3Key = this.buildOriginalKey(videoId.toString(), dto.filename);

    // ── Create the placeholder document ──────────────────────────────────────
    const video = await this.videoModel.create({
      _id: videoId,
      course_id: new Types.ObjectId(dto.course_id),
      lesson_id: dto.lesson_id ? new Types.ObjectId(dto.lesson_id) : undefined,
      teacher_id: teacherId,
      original: {
        key: s3Key,
        size_bytes: dto.size_bytes,
        format: dto.mime_type,
        duration_seconds: dto.duration_seconds ?? 0,
      },
      processed: { status: 'pending' },
    });

    // ── Generate (stubbed) presigned URL ──────────────────────────────────────
    const presigned = this.buildStubPresignedUrl(s3Key, dto.mime_type);

    this.logger.log(
      `Video ${videoId} created for teacher ${teacherId}. S3 key: ${s3Key}`,
    );

    return { presigned, video };
  }

  /**
   * Builds a *stub* presigned upload response.
   *
   * TODO (IMPLEMENTATION_PLAN_PART3.md §7 – Step 1):
   *   Replace this with a real AWS SDK v3 call:
   *   ```ts
   *   import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
   *   import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
   *
   *   const cmd = new PutObjectCommand({
   *     Bucket: this.appConfig.awsS3VideoBucket,
   *     Key: s3Key,
   *     ContentType: mimeType,
   *   });
   *   const url = await getSignedUrl(s3Client, cmd, { expiresIn: 900 });
   *   ```
   */
  private buildStubPresignedUrl(
    s3Key: string,
    mimeType: string,
  ): PresignedUploadResponse {
    const bucket = this.appConfig.awsS3VideoBucket || 'nexvera-videos-raw';
    const region = 'us-east-1'; // TODO: read from config
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    return {
      upload_url: `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}?X-Amz-Signature=STUB_${randomUUID().replace(/-/g, '')}`,
      s3_key: s3Key,
      method: 'PUT',
      headers: { 'Content-Type': mimeType },
      expires_at: expiresAt,
    };
  }

  // ─── Find / read ──────────────────────────────────────────────────────────

  async findById(id: string): Promise<VideoDocument> {
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException('Invalid video ID');
    const video = await this.videoModel.findById(id).exec();
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }

  /** List all videos belonging to a specific teacher. */
  async findByTeacher(teacherId: string) {
    const data = await this.videoModel
      .find({ teacher_id: teacherId })
      .sort({ created_at: -1 })
      .exec();
    return { success: true, data };
  }

  // ─── Processing ───────────────────────────────────────────────────────────

  /**
   * Marks a video as 'processing' and publishes a job to the processing queue.
   *
   * TODO (IMPLEMENTATION_PLAN_PART3.md §7 – Steps 2 & 3):
   *   Replace the log statement below with a real queue publish, e.g.:
   *   - RabbitMQ:  `this.amqpConnection.publish('video.exchange', 'video.process', { videoId })`
   *   - AWS SQS:   `sqsClient.send(new SendMessageCommand({ QueueUrl, MessageBody }))`
   *   - BullMQ:    `this.videoQueue.add('transcode', { videoId })`
   *
   * The Lambda trigger described in the plan fires automatically from an S3
   * event (s3:ObjectCreated) and does NOT need this endpoint for production.
   * This endpoint exists for manual/admin triggers and local testing.
   */
  async triggerProcessing(
    id: string,
    requesterId: string,
  ): Promise<{ success: boolean; data: VideoDocument }> {
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException('Invalid video ID');

    const video = await this.videoModel.findById(id).exec();
    if (!video) throw new NotFoundException('Video not found');

    // Only the owning teacher or admin can trigger processing
    if (video.teacher_id !== requesterId) {
      throw new ForbiddenException('You do not own this video');
    }

    video.processed.status = 'processing';
    await video.save();

    // TODO: Replace with real queue publish (see IMPLEMENTATION_PLAN_PART3.md §7 – Step 2)
    this.logger.log(
      `[STUB] Enqueuing MediaConvert job for video ${id}. ` +
        `In production, publish to RabbitMQ/SQS with: { videoId: '${id}', s3Key: '${video.original.key}' }`,
    );

    return { success: true, data: video };
  }

  /**
   * Simulates a successful MediaConvert processing run.
   *
   * This method is intended for **local development and testing only**.
   * In production, a Lambda worker triggered by MediaConvert CloudWatch events
   * will call back into the API (or update Mongo directly) with real HLS URLs.
   *
   * TODO (IMPLEMENTATION_PLAN_PART3.md §7 – Step 4):
   *   Replace with a real worker/webhook handler that:
   *     1. Receives MediaConvert job completion event.
   *     2. Reads produced S3 keys from the event payload.
   *     3. Builds CloudFront URLs.
   *     4. Updates the Video document with real manifest_url / qualities.
   */
  async simulateProcessing(
    id: string,
  ): Promise<{ success: boolean; data: VideoDocument }> {
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException('Invalid video ID');

    const video = await this.videoModel.findById(id).exec();
    if (!video) throw new NotFoundException('Video not found');

    const base = `videos/${id}`;
    const hlsManifestKey = `${base}/master.m3u8`;

    // Fake HLS outputs matching the MediaConvert template in the plan
    const qualities = [
      {
        resolution: '360p',
        bitrate: 800_000,
        url: this.cdnUrl(`${base}/360p/index.m3u8`),
      },
      {
        resolution: '480p',
        bitrate: 1_500_000,
        url: this.cdnUrl(`${base}/480p/index.m3u8`),
      },
      {
        resolution: '720p',
        bitrate: 2_500_000,
        url: this.cdnUrl(`${base}/720p/index.m3u8`),
      },
      {
        resolution: '1080p',
        bitrate: 5_000_000,
        url: this.cdnUrl(`${base}/1080p/index.m3u8`),
      },
    ];

    video.processed.status = 'completed';
    video.processed.manifest_url = this.cdnUrl(hlsManifestKey);
    video.processed.qualities = qualities as any;
    video.processed.thumbnail_url = this.cdnUrl(`${base}/thumbnail.jpg`);
    video.processed.thumbnails_vtt = this.cdnUrl(`${base}/thumbnails.vtt`);
    video.processed_at = new Date();
    await video.save();

    this.logger.log(`[STUB] Simulated processing complete for video ${id}`);

    return { success: true, data: video };
  }

  // ─── Playback metadata ────────────────────────────────────────────────────

  /**
   * Returns the minimal data needed by a video player:
   *   - HLS master manifest URL (via CloudFront)
   *   - Available quality renditions
   *   - Caption tracks
   *
   * Intentionally **excludes** internal details (raw S3 keys, teacher_id, etc.).
   *
   * TODO: Add enrollment check once the EnrollmentsService is injectable here.
   * See IMPLEMENTATION_PLAN_PART2.md §5 (Enrollments Collection) for the query.
   */
  async getPlaybackMetadata(id: string) {
    const video = await this.findById(id);

    if (video.processed.status !== 'completed') {
      return {
        success: false,
        error: {
          code: 'VIDEO_NOT_READY',
          message: 'Video is not yet available for playback',
          status: video.processed.status,
        },
      };
    }

    // Only expose what the player needs
    return {
      success: true,
      data: {
        video_id: video._id,
        manifest_url: video.processed.manifest_url,
        qualities: video.processed.qualities.map((q) => ({
          resolution: q.resolution,
          bitrate: q.bitrate,
          url: q.url,
        })),
        thumbnail_url: video.processed.thumbnail_url,
        thumbnails_vtt: video.processed.thumbnails_vtt,
        captions: video.captions.map((c) => ({
          language: c.language,
          url: c.url,
          auto_generated: c.auto_generated,
        })),
        duration_seconds: video.original.duration_seconds,
      },
    };
  }

  // ─── Captions ─────────────────────────────────────────────────────────────

  async addCaption(id: string, teacherId: string, dto: AddCaptionDto) {
    const video = await this.findById(id);
    if (video.teacher_id !== teacherId)
      throw new ForbiddenException('Not your video');

    video.captions.push({
      language: dto.language,
      url: dto.url,
      auto_generated: dto.auto_generated ?? false,
    } as any);

    await video.save();
    return { success: true, data: video.captions };
  }

  // ─── Engagement ───────────────────────────────────────────────────────────

  /**
   * Increments the view counter for a video.
   * Called by the player client on each new playback session.
   */
  async recordView(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    await this.videoModel.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async remove(id: string, requesterId: string): Promise<{ success: boolean }> {
    const video = await this.findById(id);
    if (video.teacher_id !== requesterId)
      throw new ForbiddenException('Not your video');

    // TODO: Also delete S3 objects (original + processed) using AWS SDK
    await this.videoModel.findByIdAndDelete(id).exec();
    this.logger.log(
      `Video ${id} deleted. TODO: remove S3 objects for key prefix videos/${id}/`,
    );

    return { success: true };
  }
}
