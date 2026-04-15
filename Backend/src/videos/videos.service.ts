import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Video, VideoDocument } from './schemas/video.schema';
import {
  LiveClass,
  LiveClassDocument,
} from '../live-classes/schemas/live-class.schema';
import {
  InitiateUploadDto,
  AddCaptionDto,
  CompleteProcessingDto,
} from './dto/video.dto';
import { UserRole } from '../users/entities/user.entity';
import { AppConfigService } from '../app-config/app-config.service';
import { VideoProcessingQueueService } from '../video-processing-queue/video-processing-queue.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';

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
  private readonly s3: S3Client;

  constructor(
    @InjectModel(Video.name) private readonly videoModel: Model<VideoDocument>,
    @InjectModel(LiveClass.name)
    private readonly liveClassModel: Model<LiveClassDocument>,
    private readonly appConfig: AppConfigService,
    private readonly queueService: VideoProcessingQueueService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {
    this.s3 = new S3Client({
      region: this.appConfig.awsRegion,
    });
  }

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

    // ── Generate real presigned URL ──────────────────────────────────────────
    const presigned = await this.buildPresignedUrl(s3Key, dto.mime_type);

    this.logger.log(
      `Video ${videoId} created for teacher ${teacherId}. S3 key: ${s3Key}`,
    );

    return { presigned, video };
  }

  private async buildPresignedUrl(
    s3Key: string,
    mimeType: string,
  ): Promise<PresignedUploadResponse> {
    const bucket = this.appConfig.awsS3VideoBucket;
    const region = this.appConfig.awsRegion;

    if (!bucket || !region) {
      this.logger.error(
        'Video upload S3 configuration is missing. Ensure AWS_S3_VIDEO_BUCKET and AWS_REGION are set.',
      );
      throw new InternalServerErrorException(
        'Video upload configuration is invalid – contact support.',
      );
    }

    const expiresInSeconds = 15 * 60; // 15 minutes

    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.s3, cmd, {
      expiresIn: expiresInSeconds,
    });

    const expiresAt = new Date(
      Date.now() + expiresInSeconds * 1000,
    ).toISOString();

    return {
      upload_url: uploadUrl,
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

  /** List all videos belonging to a specific teacher. Admin sees everything. */
  async findByTeacher(teacherId: string, role?: string) {
    const query = role === UserRole.ADMIN ? {} : { teacher_id: teacherId };

    const data = await this.videoModel
      .find(query)
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

    // ── Publish to SQS ──────────────────────────────────────────────────────
    await this.queueService.publishJob({
      videoId: video._id.toString(),
      s3Key: video.original.key,
      source: 'upload',
    });

    return { success: true, data: video };
  }

  /**
   * Finalizes video processing by updating the Video document with:
   *  - HLS manifest URL
   *  - Quality renditions
   *  - Thumbnails
   *  - Duration + processed_at timestamp
   *
   * Intended to be called by an internal worker/Lambda once MediaConvert
   * has produced the outputs in S3.
   */
  async completeProcessing(
    id: string,
    payload: CompleteProcessingDto,
  ): Promise<{ success: boolean; data: VideoDocument }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid video ID');
    }

    const video = await this.videoModel.findById(id).exec();
    if (!video) throw new NotFoundException('Video not found');

    const currentStatus = video.processed.status;

    // ── Idempotency & Order Check ────────────────────────────────────────────

    // 1. If already completed and we get another 'completed', return early.
    if (currentStatus === 'completed' && payload.status === 'completed') {
      this.logger.log(`Video ${id} already completed. Idempotent return.`);
      return { success: true, data: video };
    }

    // 2. If already completed and we get 'failed', ignore it (don't regress).
    if (currentStatus === 'completed' && payload.status === 'failed') {
      this.logger.warn(
        `Ignoring 'failed' status for already completed video ${id}.`,
      );
      return { success: true, data: video };
    }

    // ── Handle Failure ───────────────────────────────────────────────────────
    if (payload.status === 'failed') {
      video.processed.status = 'failed';
      await video.save();
      this.logger.error(`Video ${id} processing marked as FAILED by worker.`);

      // Update LiveClass only if it's not already 'available'
      if (video.source === 'live_recording' && video.live_class_id) {
        await this.liveClassModel.findOneAndUpdate(
          {
            _id: video.live_class_id,
            'recording.status': { $ne: 'available' },
          },
          { 'recording.status': 'failed' },
        );
      }

      return { success: true, data: video };
    }

    // ── Handle Success ───────────────────────────────────────────────────────

    // We expect base_key to be provided by the worker in production.
    if (!payload.base_key) {
      throw new BadRequestException(
        'base_key is required for successful processing',
      );
    }

    const base = payload.base_key;
    const hlsManifestKey = `${base}/master.m3u8`;

    // Standard quality ladder & bitrates
    const qualities = [
      { resolution: '360p', bitrate: 800_000, key: `${base}/360p/index.m3u8` },
      {
        resolution: '480p',
        bitrate: 1_500_000,
        key: `${base}/480p/index.m3u8`,
      },
      {
        resolution: '720p',
        bitrate: 2_500_000,
        key: `${base}/720p/index.m3u8`,
      },
      {
        resolution: '1080p',
        bitrate: 5_000_000,
        key: `${base}/1080p/index.m3u8`,
      },
    ];

    video.processed.status = 'completed';
    video.processed.manifest_url = this.cdnUrl(hlsManifestKey);
    video.processed.qualities = qualities.map((q) => ({
      resolution: q.resolution,
      bitrate: q.bitrate,
      url: this.cdnUrl(q.key),
    })) as any;
    video.processed.thumbnail_url = this.cdnUrl(`${base}/thumbnail.jpg`);
    video.processed.thumbnails_vtt = null;

    if (typeof payload.duration_seconds === 'number') {
      video.original.duration_seconds = payload.duration_seconds;
    }

    // Only set processed_at on the first transition to completed
    if (!video.processed_at) {
      video.processed_at = new Date();
    }

    await video.save();

    // ── Sync to LiveClass if it's a recording ────────────────────────────────
    if (video.source === 'live_recording' && video.live_class_id) {
      await this.liveClassModel.findByIdAndUpdate(video.live_class_id, {
        'recording.status': 'available',
        'recording.video_id': video._id,
      });
      this.logger.log(
        `Live class ${video.live_class_id} recording marked as AVAILABLE.`,
      );
    }

    this.logger.log(
      `Video ${id} processing completed. HLS manifest: ${video.processed.manifest_url}`,
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
    if (this.appConfig.environment === 'production') {
      throw new ForbiddenException(
        'simulateProcessing is not available in production',
      );
    }
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
   * Only allows access to:
   *   1. Admins
   *   2. The owning teacher
   *   3. Actively enrolled students
   */
  async getPlaybackMetadata(
    id: string,
    requester: { id: string; role: UserRole } | null,
  ) {
    if (!requester) {
      throw new ForbiddenException(
        'Authentication required to access playback',
      );
    }

    const video = await this.findById(id);

    // ── Authorization Logic ──────────────────────────────────────────────────
    let isAuthorized = false;

    if (requester.role === UserRole.ADMIN) {
      isAuthorized = true;
    } else if (requester.role === UserRole.TEACHER) {
      isAuthorized = video.teacher_id === requester.id;
    } else if (requester.role === UserRole.STUDENT) {
      isAuthorized = await this.enrollmentsService.isActiveCourseEnrollment(
        video.course_id.toString(),
        requester.id,
      );
    }

    if (!isAuthorized) {
      throw new ForbiddenException(
        'You do not have permission to view this video. Enrollment required.',
      );
    }

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
  /**
   * Creates a Video document for a finished live-class recording
   * and triggers the processing pipeline.
   */
  async createVideoFromRecording(
    courseId: string,
    liveClassId: string,
    teacherId: string,
    s3Key: string,
    title: string,
  ): Promise<VideoDocument> {
    const video = await this.videoModel.create({
      course_id: new Types.ObjectId(courseId),
      teacher_id: teacherId,
      live_class_id: new Types.ObjectId(liveClassId),
      source: 'live_recording',
      original: {
        key: s3Key,
        format: 'video/mp4', // Agora default
        size_bytes: 0,
        duration_seconds: 0,
      },
      processed: {
        status: 'processing',
        manifest_url: null,
        qualities: [],
        thumbnail_url: null,
        thumbnails_vtt: null,
      },
      title: `Recording: ${title}`,
    });

    // ── Publish to SQS ──────────────────────────────────────────────────────
    await this.queueService.publishJob({
      videoId: (video._id as any).toString(),
      s3Key: s3Key,
      source: 'live_recording',
    });

    this.logger.log(
      `Created video ${video._id} from recording ${liveClassId} and queued for processing.`,
    );

    return video;
  }
}
