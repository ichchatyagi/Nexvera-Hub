import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { InitiateUploadDto, TriggerProcessingDto, AddCaptionDto } from './dto/video.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  // ─── Teacher / Admin endpoints ────────────────────────────────────────────

  /**
   * POST /videos/upload-url
   *
   * Initiates a direct-to-S3 upload by:
   *   1. Creating a Video document (status = 'pending') in MongoDB.
   *   2. Returning a (stubbed) presigned S3 PUT URL.
   *
   * The client must PUT the raw file to `presigned.upload_url` directly.
   * After the PUT succeeds, the S3 event triggers the Lambda → MediaConvert
   * pipeline automatically in production.
   *
   * Roles: TEACHER, ADMIN
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Post('upload-url')
  @HttpCode(HttpStatus.CREATED)
  async initiateUpload(
    @CurrentUser() user: User,
    @Body() dto: InitiateUploadDto,
  ) {
    const result = await this.videosService.initiateUpload(user.id, dto);
    return {
      success: true,
      data: {
        video_id: result.video._id,
        presigned: result.presigned,
        status: result.video.processed.status,
        created_at: result.video.created_at,
      },
    };
  }

  /**
   * GET /videos/my
   *
   * Lists all videos uploaded by the currently authenticated teacher.
   *
   * Roles: TEACHER, ADMIN
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Get('my')
  getMyVideos(@CurrentUser() user: User) {
    return this.videosService.findByTeacher(user.id);
  }

  /**
   * GET /videos/:id
   *
   * Returns full video metadata (teacher management view).
   * Includes original S3 key, processing status, all qualities, etc.
   *
   * Roles: TEACHER, ADMIN (owner or admin)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Get(':id')
  async getVideo(@CurrentUser() user: User, @Param('id') id: string) {
    const video = await this.videosService.findById(id);
    return { success: true, data: video };
  }

  /**
   * POST /videos/:id/process
   *
   * Marks a video as 'processing' and publishes a job to the queue (stubbed).
   *
   * Use this endpoint to:
   *   - Manually re-trigger processing after a failure.
   *   - Test the processing flow in local/dev without S3 events.
   *
   * In production, this is automatically called by an S3 → Lambda trigger.
   * See IMPLEMENTATION_PLAN_PART3.md §7 – "Step 2: Trigger Processing".
   *
   * Roles: TEACHER (owner), ADMIN
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Post(':id/process')
  @HttpCode(HttpStatus.ACCEPTED)
  triggerProcessing(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() _dto: TriggerProcessingDto, // reserved for future quality-ladder overrides
  ) {
    return this.videosService.triggerProcessing(id, user.id);
  }

  /**
   * POST /videos/:id/simulate-processing
   *
   * **Development / testing only** – simulates a complete MediaConvert run,
   * populating fake HLS URLs so you can test the playback flow end-to-end
   * without real AWS infrastructure.
   *
   * Remove or gate behind an ENV flag before deploying to production.
   *
   * Roles: ADMIN only (to prevent accidental use in staging by teachers)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/simulate-processing')
  simulateProcessing(@Param('id') id: string) {
    return this.videosService.simulateProcessing(id);
  }

  /**
   * POST /videos/:id/captions
   *
   * Adds a caption track (WebVTT or SRT) to a video.
   * The URL should already be uploaded to S3/CloudFront before calling this.
   *
   * Roles: TEACHER (owner), ADMIN
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Post(':id/captions')
  addCaption(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: AddCaptionDto,
  ) {
    return this.videosService.addCaption(id, user.id, dto);
  }

  /**
   * DELETE /videos/:id
   *
   * Deletes the video document.
   * TODO: Also purge the raw + processed S3 objects (see VideosService.remove).
   *
   * Roles: TEACHER (owner), ADMIN
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Delete(':id')
  removeVideo(@CurrentUser() user: User, @Param('id') id: string) {
    return this.videosService.remove(id, user.id);
  }

  // ─── Student / Public playback endpoints ──────────────────────────────────

  /**
   * GET /videos/:id/playback
   *
   * Returns the minimal data needed by the video player:
   *   - HLS master manifest URL (CloudFront)
   *   - Quality renditions (resolution, bitrate, URL)
   *   - Caption tracks
   *
   * **Never leaks** raw S3 keys, teacher_id, or processing details.
   *
   * Access: JWT optional (public preview lessons could omit the guard).
   * TODO: Add enrollment check once EnrollmentsService can be injected here.
   * See IMPLEMENTATION_PLAN_PART2.md §5 (Enrollments) and
   * IMPLEMENTATION_PLAN_PART3.md §7 – "Video Access Middleware".
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/playback')
  getPlayback(@Param('id') id: string) {
    return this.videosService.getPlaybackMetadata(id);
  }

  /**
   * POST /videos/:id/view
   *
   * Increments the view counter.
   * Called by the player client on session start.
   * No auth required – anonymous views are fine.
   */
  @Post(':id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  async recordView(@Param('id') id: string) {
    await this.videosService.recordView(id);
  }
}
