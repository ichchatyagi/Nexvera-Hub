import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { LiveClassesService, AgoraRole } from './live-classes.service';
import { UserRole } from '../users/entities/user.entity';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

import { LiveClass, LiveClassStatus } from './schemas/live-class.schema';
import { Course } from '../courses/schemas/course.schema';
import { AppConfigService } from '../app-config/app-config.service';
import { VideosService } from '../videos/videos.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const TEACHER_ID = 'teacher-uuid-001';
const OTHER_TEACHER_ID = 'teacher-uuid-999';
const STUDENT_ID = 'student-uuid-001';

function makeMockLiveClass(overrides: Partial<any> = {}) {
  const id = new Types.ObjectId();
  return {
    _id: id,
    course_id: new Types.ObjectId(),
    lesson_id: null,
    teacher_id: TEACHER_ID,
    title: 'Intro to NestJS',
    description: null,
    scheduled_start: new Date('2026-05-01T10:00:00.000Z'),
    scheduled_end: new Date('2026-05-01T11:00:00.000Z'),
    timezone: 'Asia/Kolkata',
    agora: {
      channel_name: `nexvera-abc123`,
      recording_uid: null,
      whiteboard_room_uuid: null,
    },
    status: LiveClassStatus.SCHEDULED,
    product_type: 'course',
    actual_start: null,
    actual_end: null,
    max_participants: 100,
    registered_students: [] as string[],
    attended_students: [] as string[],
    recording: { enabled: false, video_id: null, status: 'pending' },
    features: {
      chat_enabled: false,
      qa_enabled: false,
      screen_share_enabled: false,
      whiteboard_enabled: false,
    },
    created_at: new Date(),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

const mockLiveClassModel = {
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

const mockCourseModel = {
  findById: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

const mockConfigService = {
  agoraAppId: 'test-agora-app-id',
  agoraAppCertificate: 'test-agora-certificate',
  agoraTokenTtlSeconds: 3600,
  useAgoraWhiteboard: true,
  agoraWhiteboardAppId: 'whiteboard-app-id',
  agoraWhiteboardAppSecret: 'whiteboard-app-secret',
  agoraWhiteboardTokenTtlSeconds: 3600,
  agoraWhiteboardRegion: 'cn-hz',
};

const mockVideosService = {
  createVideoFromRecording: jest
    .fn()
    .mockResolvedValue({ _id: new Types.ObjectId() }),
  getPlaybackMetadata: jest
    .fn()
    .mockResolvedValue({ success: true, playback_url: 'http://test.com/play' }),
};

const mockEnrollmentsService = {
  isActiveCourseEnrollment: jest.fn(),
  listActiveCourseIdsForStudent: jest.fn(),
};

const mockNotificationsService = {
  createNotification: jest.fn(),
};

// ─────────────────────────────────────────────────────────────────────────────

describe('LiveClassesService', () => {
  let service: LiveClassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiveClassesService,
        {
          provide: getModelToken(LiveClass.name),
          useValue: mockLiveClassModel,
        },
        {
          provide: getModelToken(Course.name),
          useValue: mockCourseModel,
        },
        {
          provide: AppConfigService,
          useValue: {
            ...mockConfigService,
            agoraCustomerId: 'test-customer-id',
            agoraCustomerCertificate: 'test-customer-cert',
            awsS3VideoBucket: 'test-bucket',
            awsAccessKey: 'test-key',
            awsSecretKey: 'test-secret',
            awsRegion: 'us-east-1',
          },
        },
        {
          provide: VideosService,
          useValue: mockVideosService,
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

    service = module.get<LiveClassesService>(LiveClassesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── Agora token generation ──────────────────────────────────────────────

  describe('generateAgoraToken (private)', () => {
    it('generates a real Agora token (non-empty string, not a stub)', () => {
      const channelName = 'test-channel';
      const userId = 'user-123';
      const token = service['generateAgoraToken'](
        channelName,
        userId,
        AgoraRole.SUBSCRIBER,
      );

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      expect(token.startsWith('STUB_TOKEN_')).toBe(false);
    });

    it('throws InternalServerErrorException when credentials are missing', () => {
      // Create a temporary instance with missing config
      const badConfig = { agoraAppId: '', agoraAppCertificate: '' };
      const tempService = new LiveClassesService(
        mockLiveClassModel as any,
        badConfig as any,
        mockVideosService as any,
        mockEnrollmentsService as any,
      );

      expect(() =>
        tempService['generateAgoraToken']('test', 'user', AgoraRole.SUBSCRIBER),
      ).toThrow(InternalServerErrorException);
    });
  });

  // ── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    const validDto = {
      course_id: new Types.ObjectId().toString(),
      title: 'Intro to NestJS',
      scheduled_start: '2026-05-01T10:00:00.000Z',
      scheduled_end: '2026-05-01T11:00:00.000Z',
      timezone: 'Asia/Kolkata',
    };

    it('creates a live class and returns the document', async () => {
      const mockLc = makeMockLiveClass();
      mockCourseModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ product_type: 'course' }),
      });
      mockLiveClassModel.create.mockResolvedValue(mockLc);

      const result = await service.create(TEACHER_ID, validDto as any);

      expect(mockCourseModel.findById).toHaveBeenCalledWith(validDto.course_id);
      expect(mockLiveClassModel.create).toHaveBeenCalledTimes(1);
      const arg = mockLiveClassModel.create.mock.calls[0][0];
      expect(arg.teacher_id).toBe(TEACHER_ID);
      expect(arg.title).toBe(validDto.title);
      expect(arg.product_type).toBe('course');
      expect(arg.status).toBe(LiveClassStatus.SCHEDULED);
      // Auto-generated channel name
      expect(arg.agora.channel_name).toMatch(/^nexvera-/);
      expect(result).toBe(mockLc);
    });

    it('requires subject_id for tuition-type courses', async () => {
      mockCourseModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ product_type: 'tuition' }),
      });

      // No subject_id provided
      await expect(service.create(TEACHER_ID, validDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('allows creation for tuition course if subject_id is provided', async () => {
      const tuitionDto = { ...validDto, subject_id: new Types.ObjectId().toString() };
      const mockLc = makeMockLiveClass({ product_type: 'tuition' });
      
      mockCourseModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ product_type: 'tuition' }),
      });
      mockLiveClassModel.create.mockResolvedValue(mockLc);

      const result = await service.create(TEACHER_ID, tuitionDto as any);
      expect(result).toBeDefined();
      expect(mockLiveClassModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ product_type: 'tuition' })
      );
    });

    it('throws BadRequestException when end is before start', async () => {
      const badDto = {
        ...validDto,
        scheduled_start: '2026-05-01T11:00:00.000Z',
        scheduled_end: '2026-05-01T10:00:00.000Z',
      };
      await expect(service.create(TEACHER_ID, badDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('sets product_type from course and requires subject_id for tuition (Prompt 1)', async () => {
      const courseId = new Types.ObjectId().toString();
      mockCourseModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: courseId, product_type: 'tuition' }),
      });

      // No subject_id
      await expect(
        service.create(TEACHER_ID, { ...validDto, course_id: courseId } as any),
      ).rejects.toThrow(BadRequestException);

      // With subject_id
      const subjectId = new Types.ObjectId().toString();
      mockLiveClassModel.create.mockResolvedValue(makeMockLiveClass({ product_type: 'tuition' }));
      await service.create(TEACHER_ID, { ...validDto, course_id: courseId, subject_id: subjectId } as any);
      
      expect(mockLiveClassModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ product_type: 'tuition' })
      );
    });

    it('forces recording.enabled=false for tuition on create (Prompt 2)', async () => {
      const courseId = new Types.ObjectId().toString();
      mockCourseModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: courseId, product_type: 'tuition' }),
      });
      const subjectId = new Types.ObjectId().toString();
      
      await service.create(TEACHER_ID, {
        ...validDto,
        course_id: courseId,
        subject_id: subjectId,
        recording: { enabled: true }
      } as any);

      expect(mockLiveClassModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          product_type: 'tuition',
          recording: expect.objectContaining({ enabled: false })
        })
      );
    });
  });

  // ── update ───────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('forces recording.enabled=false for tuition on update (Prompt 2)', async () => {
      const mockLc = makeMockLiveClass({
        status: LiveClassStatus.SCHEDULED,
        teacher_id: TEACHER_ID,
        product_type: 'tuition',
        recording: { enabled: true, video_id: null, status: 'pending' },
      });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      await service.update(
        mockLc._id.toString(),
        TEACHER_ID,
        false,
        { recording: { enabled: true } } as any,
      );

      expect(mockLc.recording.enabled).toBe(false);
      expect(mockLc.save).toHaveBeenCalled();
    });
  });

  // ── findByTeacher / mine ─────────────────────────────────────────────────────

  describe('findByTeacher', () => {
    it('returns all classes owned by the teacher', async () => {
      const lc1 = makeMockLiveClass();
      const lc2 = makeMockLiveClass();
      mockLiveClassModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([lc1, lc2]),
      });

      const result = await service.findByTeacher(TEACHER_ID);

      expect(mockLiveClassModel.find).toHaveBeenCalledWith({
        teacher_id: TEACHER_ID,
      });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  // ── register ─────────────────────────────────────────────────────────────────

  describe('register', () => {
    it('registers an enrolled student', async () => {
      const mockLc = makeMockLiveClass();
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(true);

      const result = await service.register(
        mockLc._id.toString(),
        STUDENT_ID,
        UserRole.STUDENT,
      );

      expect(result.success).toBe(true);
      expect(mockLc.registered_students).toContain(STUDENT_ID);
      expect(mockLc.save).toHaveBeenCalled();
    });

    it('throws ForbiddenException for non-enrolled student', async () => {
      const mockLc = makeMockLiveClass();
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(false);

      await expect(
        service.register(mockLc._id.toString(), STUDENT_ID, UserRole.STUDENT),
      ).rejects.toThrow(ForbiddenException);
    });

    it('is idempotent – does not double-register', async () => {
      const mockLc = makeMockLiveClass({
        registered_students: [STUDENT_ID],
      });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(true);

      const result = await service.register(
        mockLc._id.toString(),
        STUDENT_ID,
        UserRole.STUDENT,
      );

      // save should NOT have been called again – no change
      expect(mockLc.save).not.toHaveBeenCalled();
      expect(result.data.registered).toBe(true);
    });

    it('throws UnprocessableEntityException when class is full', async () => {
      const mockLc = makeMockLiveClass({
        max_participants: 2,
        registered_students: ['s-a', 's-b'],
      });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(true);

      await expect(
        service.register(mockLc._id.toString(), STUDENT_ID, UserRole.STUDENT),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws when trying to register for a cancelled class', async () => {
      const mockLc = makeMockLiveClass({ status: LiveClassStatus.CANCELLED });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(true);

      await expect(
        service.register(mockLc._id.toString(), STUDENT_ID, UserRole.STUDENT),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  // ── join ──────────────────────────────────────────────────────────────────

  function localDeriveUid(userId: string): number {
    if (/^\d+$/.test(userId)) {
      const parsed = parseInt(userId, 10);
      if (parsed > 0 && parsed <= 0x7fffffff) return parsed;
    }
    let hash = 5381;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) + hash) ^ userId.charCodeAt(i);
      hash |= 0;
    }
    return (Math.abs(hash) % 0x7ffffffe) + 1;
  }

  describe('join', () => {
    it('allows enrolled student to join', async () => {
      const mockLc = makeMockLiveClass();
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(true);

      const result = await service.join(
        mockLc._id.toString(),
        STUDENT_ID,
        UserRole.STUDENT,
      );

      expect(result.channel_name).toBe(mockLc.agora.channel_name);
      expect(result.rtc_token).toBeDefined();
      expect(result.agora_uid).toBe(localDeriveUid(STUDENT_ID));
      expect(result.product_type).toBe('course');
      expect(mockLc.attended_students).toContain(STUDENT_ID);
      expect(mockLc.save).toHaveBeenCalled();
    });

    it('throws ForbiddenException for non-enrolled student', async () => {
      const mockLc = makeMockLiveClass();
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(false);

      await expect(
        service.join(mockLc._id.toString(), STUDENT_ID, UserRole.STUDENT),
      ).rejects.toThrow(ForbiddenException);
    });

    it('includes product_type in join response (Prompt 1)', async () => {
      const mockLc = makeMockLiveClass({ product_type: 'tuition' });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(true);

      const result = await service.join(
        mockLc._id.toString(),
        STUDENT_ID,
        UserRole.STUDENT,
      );

      expect(result.product_type).toBe('tuition');
    });

    it('allows teacher owner to join without enrollment check', async () => {
      const mockLc = makeMockLiveClass();
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      const result = await service.join(
        mockLc._id.toString(),
        TEACHER_ID,
        UserRole.TEACHER,
      );
      expect(result.role).toBe(AgoraRole.PUBLISHER);
      expect(
        mockEnrollmentsService.isActiveCourseEnrollment,
      ).not.toHaveBeenCalled();
    });

    it('allows admin to join without enrollment check', async () => {
      const mockLc = makeMockLiveClass();
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      const result = await service.join(
        mockLc._id.toString(),
        'admin-uuid',
        UserRole.ADMIN,
      );
      expect(result.rtc_token).toBeDefined();
      expect(
        mockEnrollmentsService.isActiveCourseEnrollment,
      ).not.toHaveBeenCalled();
    });

    it('also works for a live class', async () => {
      const mockLc = makeMockLiveClass({ status: LiveClassStatus.LIVE });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(true);

      const result = await service.join(
        mockLc._id.toString(),
        STUDENT_ID,
        UserRole.STUDENT,
      );
      expect(result.status).toBe(LiveClassStatus.LIVE);
    });

    it('throws UnprocessableEntityException for ended or cancelled classes', async () => {
      for (const status of [LiveClassStatus.ENDED, LiveClassStatus.CANCELLED]) {
        const mockLc = makeMockLiveClass({ status });
        mockLiveClassModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockLc),
        });
        mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(true);

        await expect(
          service.join(mockLc._id.toString(), STUDENT_ID, UserRole.STUDENT),
        ).rejects.toThrow(UnprocessableEntityException);
      }
    });

    it('throws InternalServerErrorException when Agora credentials are missing', async () => {
      const mockLc = makeMockLiveClass();
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(true);

      // Override config to simulate missing credentials
      const moduleNoAgora: TestingModule = await Test.createTestingModule({
        providers: [
          LiveClassesService,
          {
            provide: getModelToken(LiveClass.name),
            useValue: mockLiveClassModel,
          },
          {
            provide: getModelToken(Course.name),
            useValue: mockCourseModel,
          },
          {
            provide: AppConfigService,
            useValue: { agoraAppId: '', agoraAppCertificate: '' },
          },
          {
            provide: VideosService,
            useValue: mockVideosService,
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

      const serviceNoAgora =
        moduleNoAgora.get<LiveClassesService>(LiveClassesService);

      await expect(
        serviceNoAgora.join(
          mockLc._id.toString(),
          STUDENT_ID,
          UserRole.STUDENT,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── start ─────────────────────────────────────────────────────────────────

  describe('start', () => {
    it('transitions status to live and sets actual_start and sends notifications', async () => {
      const courseId = new Types.ObjectId();
      const mockLc = makeMockLiveClass({ 
        teacher_id: 't1',
        registered_students: ['s1', 's2'],
        title: 'Test Class',
        course_id: courseId
      });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      const result = await service.start(
        mockLc._id.toString(),
        't1',
        false,
      );

      expect(result.status).toBe(LiveClassStatus.LIVE);
      expect(result.actual_start).toBeInstanceOf(Date);
      expect(mockLc.save).toHaveBeenCalled();
      
      expect(mockNotificationsService.createNotification).toHaveBeenCalledTimes(3);
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 't1', type: NotificationType.LIVE_CLASS_STARTED })
      );
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 's1', type: NotificationType.LIVE_CLASS_STARTED })
      );
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 's2', type: NotificationType.LIVE_CLASS_STARTED })
      );
    });

    it('throws for non-owner when isAdmin is false', async () => {
      const mockLc = makeMockLiveClass();
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      await expect(
        service.start(mockLc._id.toString(), OTHER_TEACHER_ID, false),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows admin to start any class', async () => {
      const mockLc = makeMockLiveClass();
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      const result = await service.start(
        mockLc._id.toString(),
        OTHER_TEACHER_ID,
        true,
      );
      expect(result.status).toBe(LiveClassStatus.LIVE);
    });

    it('throws UnprocessableEntityException for cancelled class', async () => {
      const mockLc = makeMockLiveClass({ status: LiveClassStatus.CANCELLED });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      await expect(
        service.start(mockLc._id.toString(), TEACHER_ID, false),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('tries to start Agora recording if recording is enabled', async () => {
      const mockLc = makeMockLiveClass({
        recording: { enabled: true, video_id: null, status: 'pending' },
      });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      mockedAxios.post.mockResolvedValueOnce({
        data: { resourceId: 'res-123' },
      }); // acquire
      mockedAxios.post.mockResolvedValueOnce({ data: { sid: 'sid-123' } }); // start

      const result = await service.start(
        mockLc._id.toString(),
        TEACHER_ID,
        false,
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      expect(result.recording.resource_id).toBe('res-123');
      expect(result.recording.sid).toBe('sid-123');
      expect(result.recording.status).toBe('processing');
    });

    it('sets recording.enabled=false if Agora acquire fails', async () => {
      const mockLc = makeMockLiveClass({
        recording: { enabled: true, video_id: null, status: 'pending' },
      });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      mockedAxios.post.mockRejectedValueOnce(new Error('Agora API Error'));

      const result = await service.start(
        mockLc._id.toString(),
        TEACHER_ID,
        false,
      );

      expect(result.recording.enabled).toBe(false);
      expect(result.status).toBe(LiveClassStatus.LIVE); // Class still starts
    });
  });

  // ── end ───────────────────────────────────────────────────────────────────

  describe('end', () => {
    it('transitions status to ended and sets actual_end and sends notification', async () => {
      const mockLc = makeMockLiveClass({
        status: LiveClassStatus.LIVE,
        actual_start: new Date(),
        registered_students: ['s1'],
      });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      const result = await service.end(
        mockLc._id.toString(),
        TEACHER_ID,
        false,
      );

      expect(result.status).toBe(LiveClassStatus.ENDED);
      expect(result.actual_end).toBeInstanceOf(Date);
      expect(mockLc.save).toHaveBeenCalled();
      expect(mockNotificationsService.createNotification).toHaveBeenCalled();
    });

    it('throws UnprocessableEntityException for already ended class', async () => {
      const mockLc = makeMockLiveClass({ status: LiveClassStatus.ENDED });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      await expect(
        service.end(mockLc._id.toString(), TEACHER_ID, false),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('tries to stop Agora recording and extracts S3 key from JSON list', async () => {
      const mockLc = makeMockLiveClass({
        status: LiveClassStatus.LIVE,
        actual_start: new Date(),
        recording: {
          enabled: true,
          resource_id: 'res-123',
          sid: 'sid-123',
          status: 'processing',
        },
      });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      // Agora response with JSON string fileList
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          serverResponse: {
            fileList: JSON.stringify([
              { filename: 'ignored.txt' },
              { filename: 'recordings/live_mixed.mp4' },
            ]),
          },
        },
      });

      const result = await service.end(
        mockLc._id.toString(),
        TEACHER_ID,
        false,
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockVideosService.createVideoFromRecording).toHaveBeenCalledWith(
        mockLc.course_id.toString(),
        mockLc._id.toString(),
        TEACHER_ID,
        'recordings/live_mixed.mp4',
        mockLc.title,
      );
      expect(result.recording.file_key).toBe('recordings/live_mixed.mp4');
      expect(result.recording.status).toBe('processing');
    });

    it('marks recording as failed if no usable key is found', async () => {
      const mockLc = makeMockLiveClass({
        status: LiveClassStatus.LIVE,
        actual_start: new Date(),
        recording: {
          enabled: true,
          resource_id: 'res-123',
          sid: 'sid-123',
          status: 'processing',
        },
      });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      // Agora response with no fileList or invalid one
      mockedAxios.post.mockResolvedValueOnce({
        data: { serverResponse: { fileList: null } },
      });

      const result = await service.end(
        mockLc._id.toString(),
        TEACHER_ID,
        false,
      );

      expect(mockVideosService.createVideoFromRecording).not.toHaveBeenCalled();
      expect(result.recording.status).toBe('failed');
    });
  });

  describe('extractRecordingS3Key (private)', () => {
    it('handles plain string fileList', () => {
      const res = { serverResponse: { fileList: 'path/to/file.mp4' } };
      expect(service['extractRecordingS3Key'](res)).toBe('path/to/file.mp4');
    });

    it('handles JSON string array of objects', () => {
      const res = {
        serverResponse: {
          fileList: JSON.stringify([
            { filename: '1.txt' },
            { filename: '2.mp4' },
          ]),
        },
      };
      expect(service['extractRecordingS3Key'](res)).toBe('2.mp4');
    });

    it('handles actual array of objects', () => {
      const res = {
        serverResponse: {
          fileList: [{ key: 'first.txt' }, { key: 'second.mp4' }],
        },
      };
      expect(service['extractRecordingS3Key'](res)).toBe('second.mp4');
    });

    it('falls back to first file if no mp4 found', () => {
      const res = {
        serverResponse: {
          fileList: [{ filename: 'only_one.ts' }],
        },
      };
      expect(service['extractRecordingS3Key'](res)).toBe('only_one.ts');
    });

    it('returns null if fileList is missing', () => {
      expect(service['extractRecordingS3Key']({})).toBeNull();
      expect(
        service['extractRecordingS3Key']({ serverResponse: {} }),
      ).toBeNull();
    });
  });

  // ── cancel ────────────────────────────────────────────────────────────────

  describe('cancel', () => {
    it('marks a scheduled class as cancelled', async () => {
      const mockLc = makeMockLiveClass();
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      const result = await service.cancel(
        mockLc._id.toString(),
        TEACHER_ID,
        false,
      );

      expect(result.status).toBe(LiveClassStatus.CANCELLED);
      expect(mockLc.save).toHaveBeenCalled();
    });

    it('throws when trying to cancel an already-live class', async () => {
      const mockLc = makeMockLiveClass({ status: LiveClassStatus.LIVE });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      await expect(
        service.cancel(mockLc._id.toString(), TEACHER_ID, false),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  // ── getRecordingPlayback ──────────────────────────────────────────────────

  describe('getRecordingPlayback', () => {
    it('allows teacher owner to access recording', async () => {
      const videoId = new Types.ObjectId();
      const mockLc = makeMockLiveClass({
        recording: { video_id: videoId, status: 'available' },
        product_type: 'course'
      });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      const result = await service.getRecordingPlayback(
        mockLc._id.toString(),
        TEACHER_ID,
        UserRole.TEACHER,
      );

      expect(result.success).toBe(true);
      expect(mockVideosService.getPlaybackMetadata).toHaveBeenCalledWith(
        videoId.toString(),
        { id: TEACHER_ID, role: UserRole.TEACHER },
      );
    });

    it('returns error for tuition recording playback (Prompt 2)', async () => {
      const mockLc = makeMockLiveClass({ product_type: 'tuition' });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      const result = await service.getRecordingPlayback(
        mockLc._id.toString(),
        TEACHER_ID,
        UserRole.TEACHER,
      );

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('RECORDING_DISABLED_FOR_TUITION');
      expect(mockVideosService.getPlaybackMetadata).not.toHaveBeenCalled();
    });

    it('allows enrolled student to access recording', async () => {
      const videoId = new Types.ObjectId();
      const mockLc = makeMockLiveClass({
        recording: { video_id: videoId, status: 'available' },
      });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(true);

      const result = await service.getRecordingPlayback(
        mockLc._id.toString(),
        STUDENT_ID,
        UserRole.STUDENT,
      );

      expect(result.success).toBe(true);
      expect(
        mockEnrollmentsService.isActiveCourseEnrollment,
      ).toHaveBeenCalledWith(mockLc.course_id.toString(), STUDENT_ID);
      expect(mockVideosService.getPlaybackMetadata).toHaveBeenCalledWith(
        videoId.toString(),
        { id: STUDENT_ID, role: UserRole.STUDENT },
      );
    });

    it('throws ForbiddenException for non-enrolled student', async () => {
      const mockLc = makeMockLiveClass({
        recording: { video_id: new Types.ObjectId(), status: 'available' },
      });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(false);

      await expect(
        service.getRecordingPlayback(
          mockLc._id.toString(),
          STUDENT_ID,
          UserRole.STUDENT,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException for student when not owner and not admin', async () => {
      // This is already covered by the non-enrolled student test but good to be explicit
      const mockLc = makeMockLiveClass();
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      await expect(
        service.getRecordingPlayback(
          mockLc._id.toString(),
          'some-other-id',
          'other-role' as any,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('returns error if recording video_id is missing', async () => {
      const mockLc = makeMockLiveClass({
        recording: { video_id: null, status: 'pending' },
      });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      const result = await service.getRecordingPlayback(
        mockLc._id.toString(),
        TEACHER_ID,
        UserRole.TEACHER,
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('RECORDING_NOT_AVAILABLE');
    });
  });

  // ── getWhiteboardToken ──────────────────────────────────────────────────

  describe('getWhiteboardToken', () => {
    it('generates a writer token and creates a room for the teacher', async () => {
      const mockLc = makeMockLiveClass({
        features: { whiteboard_enabled: true },
        agora: { channel_name: 'test', whiteboard_room_uuid: null },
      });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      // Mock Room Creation
      mockedAxios.post.mockResolvedValueOnce({
        data: { uuid: 'new-room-uuid' },
      });
      // Mock Token Generation
      mockedAxios.post.mockResolvedValueOnce({ data: 'real-room-token' });

      const result = await service.getWhiteboardToken(
        mockLc._id.toString(),
        TEACHER_ID,
        UserRole.TEACHER,
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.netless.link/v5/rooms',
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({ region: 'cn-hz' }),
        }),
      );
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.netless.link/v5/tokens/rooms/new-room-uuid',
        expect.objectContaining({ role: 'writer' }),
        expect.objectContaining({
          headers: expect.objectContaining({ region: 'cn-hz' }),
        }),
      );

      expect(result.success).toBe(true);
      expect((result as any).data.room_uuid).toBe('new-room-uuid');
      expect((result as any).data.app_id).toBe('whiteboard-app-id');
      expect((result as any).data.region).toBe('cn-hz');
      expect((result as any).data.room_token).toBe('real-room-token');
      expect(mockLc.agora.whiteboard_room_uuid).toBe('new-room-uuid');
      expect(mockLc.save).toHaveBeenCalled();
    });

    it('generates a reader token for an enrolled student', async () => {
      const mockLc = makeMockLiveClass({
        features: { whiteboard_enabled: true },
        agora: {
          channel_name: 'test',
          whiteboard_room_uuid: 'existing-room-uuid',
        },
      });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(true);

      // Mock Token Generation
      mockedAxios.post.mockResolvedValueOnce({ data: 'reader-token' });

      const result = await service.getWhiteboardToken(
        mockLc._id.toString(),
        STUDENT_ID,
        UserRole.STUDENT,
      );

      expect(
        mockEnrollmentsService.isActiveCourseEnrollment,
      ).toHaveBeenCalledWith(mockLc.course_id.toString(), STUDENT_ID);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.netless.link/v5/tokens/rooms/existing-room-uuid',
        expect.objectContaining({ role: 'reader' }),
        expect.objectContaining({
          headers: expect.objectContaining({ region: 'cn-hz' }),
        }),
      );

      expect(result.success).toBe(true);
      expect((result as any).data.room_token).toBe('reader-token');
    });

    it('throws ForbiddenException for non-enrolled student', async () => {
      const mockLc = makeMockLiveClass({
        features: { whiteboard_enabled: true },
        agora: {
          channel_name: 'test',
          whiteboard_room_uuid: 'existing-room-uuid',
        },
      });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(false);

      await expect(
        service.getWhiteboardToken(
          mockLc._id.toString(),
          STUDENT_ID,
          UserRole.STUDENT,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('returns error if class is not active', async () => {
      const mockLc = makeMockLiveClass({
        status: LiveClassStatus.ENDED,
        features: { whiteboard_enabled: true },
      });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      const result = await service.getWhiteboardToken(
        mockLc._id.toString(),
        TEACHER_ID,
        UserRole.TEACHER,
      );

      expect(result.success).toBe(false);
      expect((result as any).error.code).toBe('CLASS_NOT_ACTIVE');
    });

    it('throws BadRequestException if useAgoraWhiteboard is false', async () => {
      const badConfig = { ...mockConfigService, useAgoraWhiteboard: false };
      const tempService = new LiveClassesService(
        mockLiveClassModel as any,
        badConfig as any,
        mockVideosService as any,
        mockEnrollmentsService as any,
      );

      const result = await tempService.getWhiteboardToken(
        'id',
        'uid',
        UserRole.TEACHER,
      );
      expect(result.success).toBe(false);
      expect((result as any).error.code).toBe('AGORA_DISABLED');
    });

    it('returns error if whiteboard feature is disabled for the class', async () => {
      const mockLc = makeMockLiveClass({
        features: { whiteboard_enabled: false },
      });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      const result = await service.getWhiteboardToken(
        mockLc._id.toString(),
        TEACHER_ID,
        UserRole.TEACHER,
      );

      expect(result.success).toBe(false);
      expect((result as any).error.code).toBe('WHITEBOARD_DISABLED');
    });

    it('throws ForbiddenException for unauthorized user', async () => {
      const mockLc = makeMockLiveClass();
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      await expect(
        service.getWhiteboardToken(
          mockLc._id.toString(),
          'hacker',
          UserRole.TEACHER,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ── findAllForUser ─────────────────────────────────────────────────────────

  describe('findAllForUser', () => {
    const buildFindChain = (data: any[]) => ({
      sort: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(data),
    });

    it('filters by enrolled course_ids for a student', async () => {
      const courseId1 = new Types.ObjectId();
      const courseId2 = new Types.ObjectId();
      const mockLc = makeMockLiveClass({ course_id: courseId1 });

      mockEnrollmentsService.listActiveCourseIdsForStudent.mockResolvedValue([
        courseId1.toString(),
        courseId2.toString(),
      ]);
      mockLiveClassModel.find.mockReturnValue(buildFindChain([mockLc]));

      const result = await service.findAllForUser(STUDENT_ID, UserRole.STUDENT);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);

      // Verify the query included course_id and the base status filters
      const findArg = mockLiveClassModel.find.mock.calls[0][0];
      expect(findArg.course_id).toBeDefined();
      expect(findArg.course_id.$in).toHaveLength(2);
      expect(findArg.status).toBeDefined();
      expect(findArg.scheduled_end).toBeDefined();

      expect(
        mockEnrollmentsService.listActiveCourseIdsForStudent,
      ).toHaveBeenCalledWith(STUDENT_ID);
    });

    it('returns empty array immediately when student has no active enrollments', async () => {
      mockEnrollmentsService.listActiveCourseIdsForStudent.mockResolvedValue([]);

      const result = await service.findAllForUser(STUDENT_ID, UserRole.STUDENT);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      // No DB query fired
      expect(mockLiveClassModel.find).not.toHaveBeenCalled();
    });

    it('does not apply course_id filter for a teacher', async () => {
      const mockLc = makeMockLiveClass();
      mockLiveClassModel.find.mockReturnValue(buildFindChain([mockLc]));

      const result = await service.findAllForUser(TEACHER_ID, UserRole.TEACHER);

      expect(result.success).toBe(true);
      // Enrollment service must NOT be called for non-student roles
      expect(
        mockEnrollmentsService.listActiveCourseIdsForStudent,
      ).not.toHaveBeenCalled();
      // Query must NOT include a course_id restriction
      const findArg = mockLiveClassModel.find.mock.calls[0][0];
      expect(findArg.course_id).toBeUndefined();
    });
  });
});
