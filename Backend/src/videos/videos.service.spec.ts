import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { VideosService } from './videos.service';
import { Video } from './schemas/video.schema';
import { AppConfigService } from '../app-config/app-config.service';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const TEACHER_ID = 'teacher-uuid-111';
const OTHER_TEACHER_ID = 'teacher-uuid-999';

/** Factory that returns a lean video-like object with a jest.fn() save method. */
function makeMockVideo(overrides: Partial<any> = {}) {
  const id = new Types.ObjectId();
  return {
    _id: id,
    course_id: new Types.ObjectId(),
    teacher_id: TEACHER_ID,
    original: {
      key: `originals/${id}/original.mp4`,
      size_bytes: 1_000_000,
      format: 'video/mp4',
      duration_seconds: 120,
    },
    processed: {
      status: 'pending',
      manifest_url: null,
      qualities: [] as Array<{ resolution: string; bitrate: number; url: string }>,
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

/** Minimal AppConfigService stub for unit tests. */
const mockConfigService = {
  awsS3VideoBucket: 'test-videos-bucket',
  cloudfrontVideoDomain: 'test.cloudfront.net',
};

// ─────────────────────────────────────────────────────────────────────────────

describe('VideosService', () => {
  let service: VideosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideosService,
        {
          provide: getModelToken(Video.name),
          useValue: mockVideoModel,
        },
        {
          provide: AppConfigService,
          useValue: mockConfigService,
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
      const mockVideo = makeMockVideo({ course_id: new Types.ObjectId(courseId) });

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
      expect(result.presigned.upload_url).toMatch(/amazonaws\.com/);
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
      await expect(service.findById(validId)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException for an invalid ObjectId string', async () => {
      await expect(service.findById('not-a-valid-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── triggerProcessing ───────────────────────────────────────────────────────

  describe('triggerProcessing', () => {
    it('sets status to processing and saves', async () => {
      const mockVideo = makeMockVideo();
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      const result = await service.triggerProcessing(mockVideo._id.toString(), TEACHER_ID);

      expect(mockVideo.processed.status).toBe('processing');
      expect(mockVideo.save).toHaveBeenCalled();
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
    it('returns player-safe data when processing is completed', async () => {
      const mockVideo = makeMockVideo({
        processed: {
          status: 'completed',
          manifest_url: 'https://test.cloudfront.net/videos/abc/master.m3u8',
          qualities: [
            { resolution: '720p', bitrate: 2_500_000, url: 'https://test.cloudfront.net/videos/abc/720p/index.m3u8' },
          ],
          thumbnail_url: 'https://test.cloudfront.net/videos/abc/thumbnail.jpg',
          thumbnails_vtt: 'https://test.cloudfront.net/videos/abc/thumbnails.vtt',
        },
        captions: [{ language: 'en', url: 'https://cdn.example.com/en.vtt', auto_generated: true }],
      });

      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      const result = await service.getPlaybackMetadata(mockVideo._id.toString());

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.manifest_url).toBe('https://test.cloudfront.net/videos/abc/master.m3u8');
      expect(result.data!.qualities).toHaveLength(1);
      expect(result.data!.captions).toHaveLength(1);

      // Must NOT expose raw S3 keys (original.key)
      expect(JSON.stringify(result.data)).not.toContain('originals/');
    });

    it('returns an error payload when video is not yet ready', async () => {
      const mockVideo = makeMockVideo({ processed: { status: 'processing', manifest_url: null, qualities: [], thumbnail_url: null, thumbnails_vtt: null } });
      mockVideoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVideo),
      });

      const result = await service.getPlaybackMetadata(mockVideo._id.toString());

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
      expect(mockVideoModel.findByIdAndDelete).toHaveBeenCalledWith(mockVideo._id.toString());
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
});
