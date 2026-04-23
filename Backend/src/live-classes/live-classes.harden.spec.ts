import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ForbiddenException, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { LiveClassesService } from './live-classes.service';
import { LiveClass, LiveClassStatus } from './schemas/live-class.schema';
import { LiveClassesGateway } from './live-classes.gateway';
import { Course } from '../courses/schemas/course.schema';
import { AppConfigService } from '../app-config/app-config.service';
import { VideosService } from '../videos/videos.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

describe('LiveClassesService Hardening', () => {
  let service: LiveClassesService;
  let mockLiveClassModel: any;
  let mockCourseModel: any;
  let mockEnrollmentsService: any;
  let gateway: LiveClassesGateway;

  beforeEach(async () => {
    mockLiveClassModel = {
      findById: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
    };
    mockCourseModel = {
      findById: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };
    mockEnrollmentsService = {
      hasAccess: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiveClassesService,
        LiveClassesGateway,
        { provide: getModelToken(LiveClass.name), useValue: mockLiveClassModel },
        { provide: getModelToken('LiveClassMessage'), useValue: {} },
        { provide: getModelToken(Course.name), useValue: mockCourseModel },
        { provide: AppConfigService, useValue: { agoraAppId: 'id', agoraAppCertificate: 'cert', agoraTokenTtlSeconds: 3600, jwtSecret: 's' } },
        { provide: VideosService, useValue: {} },
        { provide: EnrollmentsService, useValue: mockEnrollmentsService },
        { provide: NotificationsService, useValue: { createNotification: jest.fn().mockResolvedValue({}) } },
        { provide: JwtService, useValue: {} },
        { provide: UsersService, useValue: { getStudentIds: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    service = module.get<LiveClassesService>(LiveClassesService);
    gateway = module.get<LiveClassesGateway>(LiveClassesGateway);
  });

  const TEACHER_ID = 'teacher-1';
  const OTHER_TEACHER_ID = 'teacher-2';
  const STUDENT_ID = 'student-1';

  describe('Authorization + Access Rules', () => {
    it('denies creation if teacher is not in course instructors', async () => {
      mockCourseModel.exec.mockResolvedValue({
        lead_instructor_id: OTHER_TEACHER_ID,
        assigned_instructor_ids: [],
        product_type: 'course',
      });

      await expect(
        service.create(TEACHER_ID, { course_id: new Types.ObjectId().toString() } as any, false)
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows creation if teacher is assigned instructor', async () => {
      mockCourseModel.exec.mockResolvedValue({
        lead_instructor_id: OTHER_TEACHER_ID,
        assigned_instructor_ids: [TEACHER_ID],
        product_type: 'course',
      });
      mockLiveClassModel.create.mockResolvedValue({ _id: 'new-id' });

      const result = await service.create(TEACHER_ID, { 
        course_id: new Types.ObjectId().toString(),
        scheduled_start: new Date(Date.now() + 1000).toISOString(),
        scheduled_end: new Date(Date.now() + 5000).toISOString(),
      } as any, false);
      expect(result).toBeDefined();
    });
  });

  describe('Lifecycle Correctness', () => {
    it('enforces live -> ended only if currently live', async () => {
      const mockLc = {
        _id: new Types.ObjectId(),
        status: LiveClassStatus.SCHEDULED,
        teacher_id: TEACHER_ID,
        save: jest.fn(),
      };
      mockLiveClassModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockLc) });

      await expect(service.end(mockLc._id.toString(), TEACHER_ID, false)).rejects.toThrow(UnprocessableEntityException);
    });

    it('enforces scheduled -> live only if not cancelled/ended', async () => {
      const mockLc = {
          _id: new Types.ObjectId(),
          status: LiveClassStatus.CANCELLED,
          teacher_id: TEACHER_ID,
          save: jest.fn(),
      };
      mockLiveClassModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockLc) });

      await expect(service.start(mockLc._id.toString(), TEACHER_ID, false)).rejects.toThrow(UnprocessableEntityException);
    });

    it('sets timestamps idempotently on start', async () => {
        const startTime = new Date('2026-01-01T10:00:00Z');
        const mockLc = {
            _id: new Types.ObjectId(),
            status: LiveClassStatus.SCHEDULED,
            actual_start: startTime,
            teacher_id: TEACHER_ID,
            save: jest.fn(),
        };
        mockLiveClassModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockLc) });

        const result = await service.start(mockLc._id.toString(), TEACHER_ID, false);
        expect(result.actual_start).toEqual(startTime); // Should NOT have been reset to 'now'
    });
  });

  describe('Attendance Tracking & Capacity Enforcement', () => {
    it('adds student to attended_students only once (idempotent)', async () => {
      const mockLc = {
        _id: new Types.ObjectId(),
        status: LiveClassStatus.LIVE,
        course_id: new Types.ObjectId(),
        teacher_id: OTHER_TEACHER_ID,
        registered_students: [STUDENT_ID],
        attended_students: [STUDENT_ID],
        max_participants: 10,
        save: jest.fn(),
        agora: { channel_name: 'test' },
        features: {},
      };
      mockLiveClassModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockLc) });
      mockEnrollmentsService.hasAccess.mockResolvedValue(true);

      await service.join(mockLc._id.toString(), STUDENT_ID, UserRole.STUDENT);
      expect(mockLc.attended_students).toEqual([STUDENT_ID]);
      expect(mockLc.save).toHaveBeenCalled();
    });

    it('enforces max_participants for students and auto-registers them', async () => {
      const mockLc = {
        _id: new Types.ObjectId(),
        status: LiveClassStatus.LIVE,
        course_id: new Types.ObjectId(),
        teacher_id: OTHER_TEACHER_ID,
        registered_students: [],
        attended_students: [],
        max_participants: 1,
        save: jest.fn(),
        agora: { channel_name: 'test' },
        features: {},
      };
      mockLiveClassModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockLc) });
      mockEnrollmentsService.hasAccess.mockResolvedValue(true);

      // Student 1 joins (auto-registers)
      await service.join(mockLc._id.toString(), STUDENT_ID, UserRole.STUDENT);
      expect(mockLc.registered_students).toContain(STUDENT_ID);
      expect(mockLc.attended_students).toContain(STUDENT_ID);

      // Student 2 joins (should fail - capacity reached)
      const STUDENT2 = 'student-2';
      mockLiveClassModel.findById.mockReturnValue({ 
        exec: jest.fn().mockResolvedValue({ 
          ...mockLc, 
          registered_students: [STUDENT_ID],
          save: jest.fn() 
        }) 
      });
      await expect(service.join(mockLc._id.toString(), STUDENT2, UserRole.STUDENT)).rejects.toThrow(UnprocessableEntityException);
    });

    it('allows teacher/admin to join even if class is full and does NOT auto-register or track attendance for them', async () => {
      const mockLc = {
        _id: new Types.ObjectId(),
        status: LiveClassStatus.LIVE,
        course_id: new Types.ObjectId(),
        teacher_id: TEACHER_ID,
        registered_students: ['s1', 's2'],
        attended_students: ['s1', 's2'],
        max_participants: 2,
        save: jest.fn(),
        agora: { channel_name: 'test' },
        features: {},
      };
      mockLiveClassModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockLc) });

      // Teacher joins
      const result = await service.join(mockLc._id.toString(), TEACHER_ID, UserRole.TEACHER);
      expect(result).toBeDefined();
      expect(mockLc.registered_students).toHaveLength(2); // No change
      expect(mockLc.attended_students).toHaveLength(2);   // No change
      expect(mockLc.save).not.toHaveBeenCalled();

      // Admin joins
      const resultAdmin = await service.join(mockLc._id.toString(), 'admin-id', UserRole.ADMIN);
      expect(resultAdmin).toBeDefined();
      expect(mockLc.registered_students).not.toContain('admin-id');
      expect(mockLc.attended_students).not.toContain('admin-id');
      expect(mockLc.save).not.toHaveBeenCalled();
    });
  });

  describe('Websocket Safety', () => {
    it('does not crash when emitting lifecycle event if server is undefined', () => {
      gateway.server = undefined as any;
      expect(() => gateway.sendLifecycleEvent('class-1', 'class:started')).not.toThrow();
    });
  });
});
