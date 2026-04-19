import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { LiveClassesService } from './live-classes.service';
import { LiveClass, LiveClassStatus } from './schemas/live-class.schema';
import { Course } from '../courses/schemas/course.schema';
import { AppConfigService } from '../app-config/app-config.service';
import { VideosService } from '../videos/videos.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

describe('LiveClassesService (Attendance Report)', () => {
  let service: LiveClassesService;
  let model: any;
  let usersService: any;

  const mockLiveClassModel = {
    find: jest.fn(),
  };

  const mockUsersService = {
    getStudentIds: jest.fn(),
  };

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
          useValue: {},
        },
        {
          provide: AppConfigService,
          useValue: {},
        },
        {
          provide: VideosService,
          useValue: {},
        },
        {
          provide: EnrollmentsService,
          useValue: {},
        },
        {
          provide: NotificationsService,
          useValue: {},
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<LiveClassesService>(LiveClassesService);
    model = module.get(getModelToken(LiveClass.name));
    usersService = module.get(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('aggregates totals correctly and buckets by day (excluding non-students)', async () => {
    const teacherId = 't1';
    const adminId = 'a1';
    const studentIds = ['s1', 's2', 's3', 's4'];
    
    // Setup Mock: UsersService should only return student IDs
    usersService.getStudentIds.mockResolvedValue(studentIds);

    const mockData = [
      {
        scheduled_start: new Date('2026-05-01T10:00:00Z'),
        teacher_id: teacherId,
        registered_students: ['s1', 's2', teacherId, adminId], // non-students should be ignored
        attended_students: ['s1', adminId],
      },
      {
        scheduled_start: new Date('2026-05-01T15:00:00Z'),
        teacher_id: teacherId,
        registered_students: ['s1', 's3'],
        attended_students: ['s1', 's3'],
      },
      {
        scheduled_start: new Date('2026-05-02T10:00:00Z'),
        teacher_id: teacherId,
        registered_students: ['s4', 'ghost-id'], // 'ghost-id' not in student list
        attended_students: [],
      },
    ];

    model.find.mockReturnValue({
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockData),
    });

    const report = await service.adminAttendanceReport({
      fromDate: '2026-05-01T00:00:00Z',
      toDate: '2026-05-05T00:00:00Z',
    });

    // Totals logic:
    // Class 1: registered: [s1, s2] (2), attended: [s1] (1)
    // Class 2: registered: [s1, s3] (2), attended: [s1, s3] (2)
    // Class 3: registered: [s4] (1), attended: [] (0)
    // Combined: Reg (5), Att (3)
    
    expect(report.totals.total_classes).toBe(3);
    expect(report.totals.total_registered).toBe(5);
    expect(report.totals.total_attended).toBe(3);
    expect(report.totals.avg_attendance_rate).toBe((3 / 5) * 100);

    // Buckets
    // 2026-05-01: Classes: 2, Reg: 4, Att: 3
    // 2026-05-02: Classes: 1, Reg: 1, Att: 0
    expect(report.by_day).toHaveLength(2);
    expect(report.by_day[0]).toEqual({
      day_utc: '2026-05-01',
      classes: 2,
      registered: 4,
      attended: 3,
    });
    expect(report.by_day[1]).toEqual({
      day_utc: '2026-05-02',
      classes: 1,
      registered: 1,
      attended: 0,
    });
  });

  it('handles empty results and avoids division by zero', async () => {
    model.find.mockReturnValue({
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    });
    usersService.getStudentIds.mockResolvedValue([]);

    const report = await service.adminAttendanceReport({});
    expect(report.totals.total_classes).toBe(0);
    expect(report.totals.avg_attendance_rate).toBe(0);
    expect(report.by_day).toHaveLength(0);
  });
});
