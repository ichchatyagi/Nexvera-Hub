import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';
import { AnalyticsService } from '../analytics/analytics.service';

const mockUser = {
  id: 'uuid-1',
  email: 'test@example.com',
  passwordHash: 'should-not-appear',
  googleId: 'should-not-appear',
  role: UserRole.STUDENT,
  emailVerified: true,
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUsersService = {
  findById: jest.fn(),
  updateProfile: jest.fn(),
  listTeachers: jest.fn(),
};

const mockAnalyticsService = {
  getOverview: jest.fn().mockResolvedValue({
    success: true,
    data: {
      users: { total_users: 100 },
      catalog: { total_courses: 50 },
      learning: { active_enrollments: 20 },
      revenue: { revenue_mtd: 1000 },
    },
  }),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: AnalyticsService, useValue: mockAnalyticsService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /users/me', () => {
    it('should return current user without sensitive fields', async () => {
      const result = await controller.getMe(mockUser as any);

      expect(result.success).toBe(true);
      // Sensitive fields must not leak
      expect((result.data as any).passwordHash).toBeUndefined();
      expect((result.data as any).googleId).toBeUndefined();
      // Expected fields must be present
      expect(result.data.id).toBe('uuid-1');
      expect(result.data.email).toBe('test@example.com');
      expect(result.data.role).toBe(UserRole.STUDENT);
    });
  });

  describe('GET /users/teachers', () => {
    it('should list teachers without sensitive fields', async () => {
      mockUsersService.listTeachers.mockResolvedValue([
        { ...mockUser, role: UserRole.TEACHER },
      ]);

      const result = await controller.listTeachers();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect((result.data[0] as any).passwordHash).toBeUndefined();
    });
  });

  describe('GET /users/admin/dashboard', () => {
    it('should return real dashboard stats for admin', async () => {
      const result = await controller.adminDashboard();

      expect(result.success).toBe(true);
      expect(result.data.overview).toBeDefined();
      expect(result.data.overview.users.total_users).toBe(100);
      expect(result.data.generated_at_utc).toBeDefined();
      expect(mockAnalyticsService.getOverview).toHaveBeenCalled();
    });
  });
});
