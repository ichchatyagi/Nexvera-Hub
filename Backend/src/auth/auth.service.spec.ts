import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AppConfigService } from '../app-config/app-config.service';
import { UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

const mockUser = {
  id: 'uuid-1',
  email: 'test@example.com',
  passwordHash: 'hashed-pw',
  role: UserRole.STUDENT,
  emailVerified: false,
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUsersService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: jest.fn(),
};

const mockAppConfigService = {
  jwtSecret: 'secret',
  jwtExpiration: '15m',
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: AppConfigService, useValue: mockAppConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a student and return tokens', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.STUDENT,
      });

      expect(result.success).toBe(true);
      expect(result.data.accessToken).toBe('mock-token');
      // Ensure passwordHash is NOT present in response
      expect((result.data.user as any).passwordHash).toBeUndefined();
    });

    it('should reject registration with admin role', async () => {
      await expect(
        service.register({
          email: 'admin@example.com',
          password: 'password123',
          role: UserRole.ADMIN as any,
        }),
      ).rejects.toThrow('Cannot self-register with admin or moderator role');
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const hashed = await bcrypt.hash('password123', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        passwordHash: hashed,
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data.accessToken).toBe('mock-token');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const hashed = await bcrypt.hash('other-password', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        passwordHash: hashed,
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nope@example.com', password: 'pw' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
