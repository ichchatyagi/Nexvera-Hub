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
import { LiveClass, LiveClassStatus } from './schemas/live-class.schema';
import { AppConfigService } from '../app-config/app-config.service';

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
    agora: { channel_name: `nexvera-abc123`, recording_uid: null },
    status: LiveClassStatus.SCHEDULED,
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

const mockConfigService = {
  agoraAppId: 'test-agora-app-id',
  agoraAppCertificate: 'test-agora-certificate',
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
          provide: AppConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<LiveClassesService>(LiveClassesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
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
      mockLiveClassModel.create.mockResolvedValue(mockLc);

      const result = await service.create(TEACHER_ID, validDto as any);

      expect(mockLiveClassModel.create).toHaveBeenCalledTimes(1);
      const arg = mockLiveClassModel.create.mock.calls[0][0];
      expect(arg.teacher_id).toBe(TEACHER_ID);
      expect(arg.title).toBe(validDto.title);
      expect(arg.status).toBe(LiveClassStatus.SCHEDULED);
      // Auto-generated channel name
      expect(arg.agora.channel_name).toMatch(/^nexvera-/);
      expect(result).toBe(mockLc);
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
    it('registers a student and records them in the array', async () => {
      const mockLc = makeMockLiveClass();
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      const result = await service.register(mockLc._id.toString(), STUDENT_ID);

      expect(result.success).toBe(true);
      expect(mockLc.registered_students).toContain(STUDENT_ID);
      expect(mockLc.save).toHaveBeenCalled();
    });

    it('is idempotent – does not double-register', async () => {
      const mockLc = makeMockLiveClass({
        registered_students: [STUDENT_ID],
      });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      const result = await service.register(mockLc._id.toString(), STUDENT_ID);

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

      await expect(
        service.register(mockLc._id.toString(), STUDENT_ID),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws when trying to register for a cancelled class', async () => {
      const mockLc = makeMockLiveClass({ status: LiveClassStatus.CANCELLED });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      await expect(
        service.register(mockLc._id.toString(), STUDENT_ID),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  // ── join ──────────────────────────────────────────────────────────────────

  describe('join', () => {
    it('returns a structured token payload for a scheduled class', async () => {
      const mockLc = makeMockLiveClass();
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      const result = await service.join(mockLc._id.toString(), STUDENT_ID);

      expect(result.channel_name).toBe(mockLc.agora.channel_name);
      expect(result.rtc_token).toBeDefined();
      // Stub format check
      expect(result.rtc_token).toContain(mockLc.agora.channel_name);
      expect(result.agora_app_id).toBe('test-agora-app-id');
      expect(result.token_expiry_seconds).toBe(3600);
      expect(result.title).toBe(mockLc.title);
      // Student should appear in attended_students
      expect(mockLc.attended_students).toContain(STUDENT_ID);
      expect(mockLc.save).toHaveBeenCalled();
    });

    it('also works for a live class', async () => {
      const mockLc = makeMockLiveClass({ status: LiveClassStatus.LIVE });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      const result = await service.join(mockLc._id.toString(), STUDENT_ID);
      expect(result.status).toBe(LiveClassStatus.LIVE);
    });

    it('throws UnprocessableEntityException for ended or cancelled classes', async () => {
      for (const status of [LiveClassStatus.ENDED, LiveClassStatus.CANCELLED]) {
        const mockLc = makeMockLiveClass({ status });
        mockLiveClassModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockLc),
        });

        await expect(
          service.join(mockLc._id.toString(), STUDENT_ID),
        ).rejects.toThrow(UnprocessableEntityException);
      }
    });

    it('throws InternalServerErrorException when Agora credentials are missing', async () => {
      const mockLc = makeMockLiveClass();
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      // Override config to simulate missing credentials
      const moduleNoAgora: TestingModule = await Test.createTestingModule({
        providers: [
          LiveClassesService,
          { provide: getModelToken(LiveClass.name), useValue: mockLiveClassModel },
          {
            provide: AppConfigService,
            useValue: { agoraAppId: '', agoraAppCertificate: '' },
          },
        ],
      }).compile();

      const serviceNoAgora = moduleNoAgora.get<LiveClassesService>(LiveClassesService);

      await expect(
        serviceNoAgora.join(mockLc._id.toString(), STUDENT_ID),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ── start ─────────────────────────────────────────────────────────────────

  describe('start', () => {
    it('transitions status to live and sets actual_start', async () => {
      const mockLc = makeMockLiveClass();
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      const result = await service.start(mockLc._id.toString(), TEACHER_ID, false);

      expect(result.status).toBe(LiveClassStatus.LIVE);
      expect(result.actual_start).toBeInstanceOf(Date);
      expect(mockLc.save).toHaveBeenCalled();
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

      const result = await service.start(mockLc._id.toString(), OTHER_TEACHER_ID, true);
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
  });

  // ── end ───────────────────────────────────────────────────────────────────

  describe('end', () => {
    it('transitions status to ended and sets actual_end', async () => {
      const mockLc = makeMockLiveClass({
        status: LiveClassStatus.LIVE,
        actual_start: new Date(),
      });
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      const result = await service.end(mockLc._id.toString(), TEACHER_ID, false);

      expect(result.status).toBe(LiveClassStatus.ENDED);
      expect(result.actual_end).toBeInstanceOf(Date);
      expect(mockLc.save).toHaveBeenCalled();
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
  });

  // ── cancel ────────────────────────────────────────────────────────────────

  describe('cancel', () => {
    it('marks a scheduled class as cancelled', async () => {
      const mockLc = makeMockLiveClass();
      mockLiveClassModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockLc),
      });

      const result = await service.cancel(mockLc._id.toString(), TEACHER_ID, false);

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
});
