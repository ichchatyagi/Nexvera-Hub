import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { VideosService } from './videos.service';
import { Video } from './schemas/video.schema';
import { LiveClass } from '../live-classes/schemas/live-class.schema';
import { AppConfigService } from '../app-config/app-config.service';
import { VideoProcessingQueueService } from '../video-processing-queue/video-processing-queue.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UserRole } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

jest.mock('@aws-sdk/s3-request-presigner');
const mockedGetSignedUrl = getSignedUrl as jest.Mock;

// ─── Mocks ────────────────────────────────────────────────────────────────────

const TEACHER_ID = 'teacher-uuid-111';
const OTHER_TEACHER_ID = 'teacher-uuid-999';
const STUDENT_ID = 'student-uuid-444';

/** Factory that returns a lean video-like object with a jest.fn() save method. */
function makeMockVideo(overrides: Partial<any> = {}) {
  const id = new Types.ObjectId();
  return {
    _id: id,
    course_id: new Types.ObjectId(),
    teacher_id: TEACHER_ID,
    live_class_id: null,
    source: 'upload',
    public_preview: false,
    original: {
      key: `originals/${id}/original.mp4`,
      size_bytes: 1_000_000,
      format: 'video/mp4',
      duration_seconds: 120,
    },
    processed: {
      status: 'pending',
      manifest_url: null,
      qualities: [] as Array<{
        resolution: string;
        bitrate: number;
        url: string;
      }>,
      thumbnail_url: null,
      thumbnails_vtt: null,
    },
    captions: [],
    views: 0,
    watch_time_total: 0,
    processed_at: null,
    created_at: new Date(),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

/** Mock Mongoose model with chainable exec(). */
const mockVideoModel = {
  create: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

const mockLiveClassModel = {
  findByIdAndUpdate: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findById: jest.fn().mockReturnValue({
    lean: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: new Types.ObjectId(),
        course_id: new Types.ObjectId(),
        title: 'Mock Live Class',
        teacher_id: 't1',
        registered_students: ['s1', 's2'],
      }),
    }),
  }),
};

/** Minimal AppConfigService stub for unit tests. */
const mockConfigService = {
  awsS3VideoBucket: 'test-videos-bucket',
  cloudfrontVideoDomain: 'test.cloudfront.net',
  awsRegion: 'us-east-1',
  environment: 'test',
  awsAccessKey: '',
  awsSecretKey: '',
};

const mockQueueService = {
  publishJob: jest.fn().mockResolvedValue(true),
};

const mockEnrollmentsService = {
  isActiveCourseEnrollment: jest.fn(),
};

const mockNotificationsService = {
  createNotification: jest.fn(),
};

// ─────────────────────────────────────────────────────────────────────────────

describe('VideosService', () => {
  let service: VideosService;

  beforeEach(async () => {
    mockedGetSignedUrl.mockResolvedValue(
      'https://test-bucket.s3.amazonaws.com/test-key?signature=stub',
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideosService,
        {
          provide: getModelToken(Video.name),
          useValue: mockVideoModel,
        },
        {
          provide: getModelToken(LiveClass.name),
          useValue: mockLiveClassModel,
        },
        {
          provide: AppConfigService,
          useValue: mockConfigService,
        },
        {
          provide: VideoProcessingQueueService,
          useValue: mockQueueService,
        },
        {
          provide: EnrollmentsService,
          useValue: mockEnrollmentsService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<VideosService>(VideosService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── Existence ───────────────────────────────────────────────────────────────

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── initiateUpload ──────────────────────────────────────────────────────────

  describe('initiateUpload', () => {
    it('creates a video document with status pending and returns a presigned URL', async () => {
      const courseId = new Types.ObjectId().toString();
      const mockVideo = makeMockVideo({
        course_id: new Types.ObjectId(courseId),
      });

      mockVideoModel.create.mockResolvedValue(mockVideo);

      const dto = {
        course_id: courseId,
        filename: 'lecture-01.mp4',
        mime_type: 'video/mp4',
        size_bytes: 50_000_000,
        duration_seconds: 600,
      };

      const result = await service.initiateUpload(TEACHER_ID, dto);

      // Document was created
      expect(mockVideoModel.create).toHaveBeenCalledTimes(1);
      const createArg = mockVideoModel.create.mock.calls[0][0];
      expect(createArg.teacher_id).toBe(TEACHER_ID);
      expect(createArg.original.size_bytes).toBe(50_000_000);
      expect(createArg.processed.status).toBe('pending');

      // Presigned URL shape
      expect(result.presigned.method).toBe('PUT');
      expect(result.presigned.upload_url).toContain('https://');
      expect(result.presigned.upload_url).toContain('amazonaws.com');
      expect(result.presigned.s3_key).toMatch(/originals\/.+\/original\.mp4/);
      expect(result.presigned.headers['Content-Type']).toBe('video/mp4');
      expect(result.presigned.expires_at).toBeTruthy();

      // Video document ref
      expect(result.video).toBe(mockVideo);
    });

    it('uses the correct s3 key pattern: originals/<id>/original.<ext>', async () => {
      const courseId = new Types.ObjectId().toString();
      mockVideoModel.create.mockResolvedValue(makeMockVideo());

      const dto = {
        course_id: courseId,
        filename: 'clip.mov',
        mime_type: 'video/quicktime',
        size_bytes: 1_000,
      };

      const result = await service.initiateUpload(TEACHER_ID, dto);
      expect(result.presigned.s3_key).toMatch(/^originals\/.+\/original\.mov$/);
    });

    it('throws InternalServerErrorException when AWS video bucket config is missing', async () => {
      const badModule = await Test.createTestingModule({
        providers: [
          VideosService,
          { provide: getModelToken(Video.name), useValue: mockVideoModel },
          {
            provide: getModelToken(LiveClass.name),
            useValue: mockLiveClassModel,
          },
          { provide: EnrollmentsService, useValue: mockEnrollmentsService },
          {
            provide: AppConfigService,
            useValue: { ...mockConfigService, awsS3VideoBucket: '' },
          },
          {
            provide: VideoProcessingQueueService,
            useValue: mockQueueService,
          },
          {
            provide: NotificationsService,
            useValue: mockNotificationsService,
          },
        ],
      }).compile();

      const badService = badModule.get<VideosService>(VideosService);

      const dto = {
        course_id: new Types.ObjectId().toString(),
        filename: 'lecture-01.mp4',
        mime_type: 'video/mp4',
        size_bytes: 50_000_000,
      };

      await expect(
        badService.initiateUpload(TEACHER_ID, dto as any),
      ).rejects.toThrow();
    });
  });

  // ── findById ────────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('returns the video when found', async () => {
      const mockVideo = makeMockVideo();
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      const result = await service.findById(mockVideo._id.toString());
      expect(result).toBe(mockVideo);
    });

    it('throws NotFoundException when video does not exist', async () => {
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      const validId = new Types.ObjectId().toString();
      await expect(service.findById(validId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException for an invalid ObjectId string', async () => {
      await expect(service.findById('not-a-valid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── triggerProcessing ───────────────────────────────────────────────────────

  describe('triggerProcessing', () => {
    it('sets status to processing and saves', async () => {
      const mockVideo = makeMockVideo();
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      const result = await service.triggerProcessing(
        mockVideo._id.toString(),
        TEACHER_ID,
      );

      expect(mockVideo.processed.status).toBe('processing');
      expect(mockVideo.save).toHaveBeenCalled();
      expect(mockQueueService.publishJob).toHaveBeenCalledWith({
        videoId: mockVideo._id.toString(),
        s3Key: mockVideo.original.key,
        source: 'upload',
      });
      expect(result.success).toBe(true);
    });

    it('throws ForbiddenException when requester is not the owner', async () => {
      const mockVideo = makeMockVideo();
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      await expect(
        service.triggerProcessing(mockVideo._id.toString(), OTHER_TEACHER_ID),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ── simulateProcessing ──────────────────────────────────────────────────────

  describe('simulateProcessing', () => {
    it('fills in HLS URLs and sets status to completed', async () => {
      const mockVideo = makeMockVideo();
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      const result = await service.simulateProcessing(mockVideo._id.toString());

      expect(result.success).toBe(true);
      expect(mockVideo.processed.status).toBe('completed');
      expect(mockVideo.processed.manifest_url).toMatch(/master\.m3u8/);
      expect(mockVideo.processed.qualities).toHaveLength(4);
      expect(mockVideo.processed.thumbnail_url).toBeTruthy();
      expect(mockVideo.processed_at).toBeInstanceOf(Date);
      expect(mockVideo.save).toHaveBeenCalled();
    });

    it('uses the configured CloudFront domain in HLS URLs', async () => {
      const mockVideo = makeMockVideo();
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      await service.simulateProcessing(mockVideo._id.toString());

      expect(mockVideo.processed.manifest_url).toContain('test.cloudfront.net');
      for (const q of mockVideo.processed.qualities) {
        expect(q.url).toContain('test.cloudfront.net');
      }
    });
  });

  // ── getPlaybackMetadata ─────────────────────────────────────────────────────

  describe('getPlaybackMetadata', () => {
    it('allows access for admin', async () => {
      const mockVideo = makeMockVideo({
        processed: {
          status: 'completed',
          manifest_url: 'http://hls',
          qualities: [],
        },
      });
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      const result = await service.getPlaybackMetadata(
        mockVideo._id.toString(),
        {
          id: 'admin-id',
          role: UserRole.ADMIN,
        },
      );

      expect(result.success).toBe(true);
    });

    it('allows access for owning teacher', async () => {
      const mockVideo = makeMockVideo({
        teacher_id: TEACHER_ID,
        processed: {
          status: 'completed',
          manifest_url: 'http://hls',
          qualities: [],
        },
      });
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      const result = await service.getPlaybackMetadata(
        mockVideo._id.toString(),
        {
          id: TEACHER_ID,
          role: UserRole.TEACHER,
        },
      );

      expect(result.success).toBe(true);
    });

    it('denies access for non-owning teacher', async () => {
      const mockVideo = makeMockVideo({
        teacher_id: TEACHER_ID,
        processed: {
          status: 'completed',
          manifest_url: 'http://hls',
          qualities: [],
        },
      });
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      await expect(
        service.getPlaybackMetadata(mockVideo._id.toString(), {
          id: OTHER_TEACHER_ID,
          role: UserRole.TEACHER,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows access for enrolled student', async () => {
      const mockVideo = makeMockVideo({
        processed: {
          status: 'completed',
          manifest_url: 'http://hls',
          qualities: [],
        },
      });
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(true);

      const result = await service.getPlaybackMetadata(
        mockVideo._id.toString(),
        {
          id: STUDENT_ID,
          role: UserRole.STUDENT,
        },
      );

      expect(result.success).toBe(true);
      expect(
        mockEnrollmentsService.isActiveCourseEnrollment,
      ).toHaveBeenCalledWith(mockVideo.course_id.toString(), STUDENT_ID);
    });

    it('denies access for non-enrolled student', async () => {
      const mockVideo = makeMockVideo({
        processed: {
          status: 'completed',
          manifest_url: 'http://hls',
          qualities: [],
        },
      });
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(false);

      await expect(
        service.getPlaybackMetadata(mockVideo._id.toString(), {
          id: 'unlucky-student',
          role: UserRole.STUDENT,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('denies access for unauthenticated requester on non-preview video', async () => {
      const mockVideo = makeMockVideo({
        public_preview: false,
        processed: { status: 'completed', manifest_url: 'http://hls', qualities: [] },
      });
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      await expect(
        service.getPlaybackMetadata(mockVideo._id.toString(), null),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows unauthenticated requester to access a public_preview video', async () => {
      const mockVideo = makeMockVideo({
        public_preview: true,
        processed: {
          status: 'completed',
          manifest_url: 'https://cdn.example.com/preview/master.m3u8',
          qualities: [{ resolution: '360p', bitrate: 400_000, url: 'https://cdn.example.com/360p/index.m3u8' }],
          thumbnail_url: 'https://cdn.example.com/thumb.jpg',
          thumbnails_vtt: null,
        },
        captions: [],
      });
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      const result = await service.getPlaybackMetadata(
        mockVideo._id.toString(),
        null,
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.manifest_url).toBe('https://cdn.example.com/preview/master.m3u8');
      // Enrollment service must not be called for anonymous preview
      expect(mockEnrollmentsService.isActiveCourseEnrollment).not.toHaveBeenCalled();
      // Must not expose raw S3 keys
      expect(JSON.stringify(result.data)).not.toContain('originals/');
    });

    it('returns VIDEO_NOT_READY for unauthenticated requester on unprocessed preview video', async () => {
      const mockVideo = makeMockVideo({
        public_preview: true,
        processed: { status: 'processing', manifest_url: null, qualities: [] },
      });
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      const result = await service.getPlaybackMetadata(
        mockVideo._id.toString(),
        null,
      );

      expect(result.success).toBe(false);
      expect((result as any).error.code).toBe('VIDEO_NOT_READY');
    });

    it('returns player-safe data when processing is completed', async () => {
      const mockVideo = makeMockVideo({
        processed: {
          status: 'completed',
          manifest_url: 'https://test.cloudfront.net/videos/abc/master.m3u8',
          qualities: [
            {
              resolution: '720p',
              bitrate: 2_500_000,
              url: 'https://test.cloudfront.net/videos/abc/720p/index.m3u8',
            },
          ],
          thumbnail_url: 'https://test.cloudfront.net/videos/abc/thumbnail.jpg',
          thumbnails_vtt:
            'https://test.cloudfront.net/videos/abc/thumbnails.vtt',
        },
        captions: [
          {
            language: 'en',
            url: 'https://cdn.example.com/en.vtt',
            auto_generated: true,
          },
        ],
      });

      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      const result = await service.getPlaybackMetadata(
        mockVideo._id.toString(),
        { id: TEACHER_ID, role: UserRole.TEACHER },
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.manifest_url).toBe(
        'https://test.cloudfront.net/videos/abc/master.m3u8',
      );
      expect(result.data!.qualities).toHaveLength(1);
      expect(result.data!.captions).toHaveLength(1);

      // Must NOT expose raw S3 keys (original.key)
      expect(JSON.stringify(result.data)).not.toContain('originals/');
    });

    it('returns an error payload when video is not yet ready', async () => {
      const mockVideo = makeMockVideo({
        processed: {
          status: 'processing',
          manifest_url: null,
          qualities: [],
          thumbnail_url: null,
          thumbnails_vtt: null,
        },
      });
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      const result = await service.getPlaybackMetadata(
        mockVideo._id.toString(),
        { id: 'admin', role: UserRole.ADMIN },
      );

      expect(result.success).toBe(false);
      expect((result as any).error.code).toBe('VIDEO_NOT_READY');
    });
  });

  // ── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('deletes the video when the owner requests it', async () => {
      const mockVideo = makeMockVideo();
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });
      mockVideoModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.remove(mockVideo._id.toString(), TEACHER_ID);
      expect(result.success).toBe(true);
      expect(mockVideoModel.findByIdAndDelete).toHaveBeenCalledWith(
        mockVideo._id.toString(),
      );
    });

    it('throws ForbiddenException when a non-owner tries to delete', async () => {
      const mockVideo = makeMockVideo();
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      await expect(
        service.remove(mockVideo._id.toString(), OTHER_TEACHER_ID),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── completeProcessing ─────────────────────────────────────────────────────

  describe('completeProcessing', () => {
    it('marks video as completed and fills HLS URLs', async () => {
      const mockVideo = makeMockVideo({
        processed: {
          status: 'processing',
          manifest_url: null,
          qualities: [],
          thumbnail_url: null,
          thumbnails_vtt: null,
        },
      });

      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      const baseKey = `videos/${mockVideo._id.toString()}`;

      const result = await service.completeProcessing(
        mockVideo._id.toString(),
        {
          base_key: baseKey,
          duration_seconds: 123,
          status: 'completed',
        } as any,
      );

      expect(result.success).toBe(true);
      expect(mockVideo.processed.status).toBe('completed');
      expect(mockVideo.processed.manifest_url).toContain('master.m3u8');
      expect(mockVideo.processed.qualities).toHaveLength(4);
      expect(mockVideo.processed.thumbnail_url).toBeTruthy();
      expect(mockVideo.processed.thumbnails_vtt).toBeNull();
      expect(mockVideo.original.duration_seconds).toBe(123);
      expect(mockVideo.processed_at).toBeInstanceOf(Date);
      expect(mockVideo.save).toHaveBeenCalled();
      // Not a recording, so no live class update
      expect(mockLiveClassModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('is idempotent when receiving duplicate success events', async () => {
      const mockVideo = makeMockVideo({ processed: { status: 'completed' } });
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      await service.completeProcessing(mockVideo._id.toString(), {
        status: 'completed',
        base_key: 'any',
      } as any);

      expect(mockVideo.save).not.toHaveBeenCalled();
    });

    it('ignores failed events for already completed videos', async () => {
      const mockVideo = makeMockVideo({ processed: { status: 'completed' } });
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      await service.completeProcessing(mockVideo._id.toString(), {
        status: 'failed',
      } as any);

      expect(mockVideo.processed.status).toBe('completed');
      expect(mockVideo.save).not.toHaveBeenCalled();
    });

    it('upgrades video status from failed to completed on rerun', async () => {
      const mockVideo = makeMockVideo({ processed: { status: 'failed' } });
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      await service.completeProcessing(mockVideo._id.toString(), {
        status: 'completed',
        base_key: 'videos/retry',
      } as any);

      expect(mockVideo.processed.status).toBe('completed');
      expect(mockVideo.save).toHaveBeenCalled();
    });

    it('throws BadRequestException if base_key is missing for completed status', async () => {
      const mockVideo = makeMockVideo({ processed: { status: 'pending' } });
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      await expect(
        service.completeProcessing(mockVideo._id.toString(), {
          status: 'completed',
        } as any),
      ).rejects.toThrow();
    });

    it('marks video as completed and updates LiveClass when source=live_recording', async () => {
      const liveClassId = new Types.ObjectId();
      const mockVideo = makeMockVideo({
        source: 'live_recording',
        live_class_id: liveClassId,
        processed: { status: 'processing' },
      });

      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      await service.completeProcessing(mockVideo._id.toString(), {
        status: 'completed',
        base_key: 'videos/abc',
        duration_seconds: 100,
      } as any);

      expect(mockVideo.processed.status).toBe('completed');
      expect(mockLiveClassModel.findByIdAndUpdate).toHaveBeenCalledWith(
        liveClassId,
        {
          'recording.status': 'available',
          'recording.video_id': mockVideo._id,
        },
      );
      
      expect(mockNotificationsService.createNotification).toHaveBeenCalledTimes(3);
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 't1', type: NotificationType.LIVE_CLASS_RECORDING_AVAILABLE })
      );
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 's1', type: NotificationType.LIVE_CLASS_RECORDING_AVAILABLE })
      );
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 's2', type: NotificationType.LIVE_CLASS_RECORDING_AVAILABLE })
      );
    });

    it('marks video as failed when status=failed is reported', async () => {
      const mockVideo = makeMockVideo({
        processed: {
          status: 'processing',
          manifest_url: null,
          qualities: [],
          thumbnail_url: null,
          thumbnails_vtt: null,
        },
      });

      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      const result = await service.completeProcessing(
        mockVideo._id.toString(),
        {
          base_key: `videos/${mockVideo._id.toString()}`,
          status: 'failed',
        } as any,
      );

      expect(result.success).toBe(true);
      expect(mockVideo.processed.status).toBe('failed');
      // Should not set manifest_url when failed
      expect(mockVideo.processed.manifest_url).toBeNull();
      expect(mockVideo.save).toHaveBeenCalled();
    });

    it('marks video as failed and updates LiveClass to failed', async () => {
      const liveClassId = new Types.ObjectId();
      const mockVideo = makeMockVideo({
        source: 'live_recording',
        live_class_id: liveClassId,
        processed: { status: 'processing' },
      });

      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });
      mockLiveClassModel.findOneAndUpdate = jest.fn().mockResolvedValue({});

      await service.completeProcessing(mockVideo._id.toString(), {
        status: 'failed',
      } as any);

      expect(mockVideo.processed.status).toBe('failed');
      expect(mockLiveClassModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: liveClassId, 'recording.status': { $ne: 'available' } },
        { 'recording.status': 'failed' },
      );
    });
  });

  // ─── createVideoFromRecording ───────────────────────────────────────────────

  describe('createVideoFromRecording', () => {
    it('creates a video and publishes an SQS job with correct linkage', async () => {
      const courseId = new Types.ObjectId().toString();
      const liveClassId = new Types.ObjectId().toString();
      const s3Key = 'recordings/live.mp4';
      const mockVideo = makeMockVideo({
        course_id: new Types.ObjectId(courseId),
        live_class_id: new Types.ObjectId(liveClassId),
        source: 'live_recording',
        title: 'Recording: Class Intro',
      });

      mockVideoModel.create.mockResolvedValue(mockVideo);

      const result = await service.createVideoFromRecording(
        courseId,
        liveClassId,
        TEACHER_ID,
        s3Key,
        'Class Intro',
      );

      expect(mockVideoModel.create).toHaveBeenCalled();
      const createArg = mockVideoModel.create.mock.calls[0][0];
      expect(createArg.live_class_id.toString()).toBe(liveClassId);
      expect(createArg.source).toBe('live_recording');

      expect(mockQueueService.publishJob).toHaveBeenCalledWith({
        videoId: mockVideo._id.toString(),
        s3Key: s3Key,
        source: 'live_recording',
      });
      expect(result).toBe(mockVideo);
    });
  });
});
