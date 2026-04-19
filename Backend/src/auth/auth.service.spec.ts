import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AppConfigService } from '../app-config/app-config.service';
import { UserRole } from '../users/entities/user.entity';
import { ContactService } from '../contact/contact.service';
import * as bcrypt from 'bcrypt';

const mockUser = {
  id: 'uuid-1',
  email: 'test@example.com',
  passwordHash: 'hashed-pw',
  role: UserRole.STUDENT,
  emailVerified: false,
  status: 'active',
  refreshTokenVersion: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUsersService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  setVerificationOtp: jest.fn().mockResolvedValue(undefined),
  bumpRefreshTokenVersion: jest.fn().mockResolvedValue(undefined),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: jest.fn(),
};

const mockAppConfigService = {
  jwtSecret: 'secret',
  jwtExpiration: '15m',
};

const mockContactService = {
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendLoginEmail: jest.fn().mockResolvedValue(undefined),
  sendOtpEmail: jest.fn().mockResolvedValue(undefined),
  sendSignupEmail: jest.fn().mockResolvedValue(undefined),
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
        { provide: ContactService, useValue: mockContactService },
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
      expect(result.message).toBe('Registration successful. Please verify your email.');
      expect(result.data.isVerified).toBe(false);
      
      expect(mockUsersService.setVerificationOtp).toHaveBeenCalledTimes(1);
      expect(mockUsersService.setVerificationOtp).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String),
        expect.any(Date)
      );
      
      expect(mockContactService.sendVerificationEmail).toHaveBeenCalledTimes(1);
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
        emailVerified: true,
        status: 'active',
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

  describe('refresh', () => {
    it('succeeds when ver matches user refreshTokenVersion', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: 'uuid-1',
        type: 'refresh',
        ver: 0,
      });
      mockUsersService.findById.mockResolvedValue({ ...mockUser, refreshTokenVersion: 0 });

      const result = await service.refresh({ refreshToken: 'valid-token' });

      expect(result.success).toBe(true);
      expect(result.data.accessToken).toBe('mock-token');
    });

    it('throws UnauthorizedException when ver mismatches user refreshTokenVersion', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: 'uuid-1',
        type: 'refresh',
        ver: 0,
      });
      // simulate user whose version was already bumped (e.g. after logout)
      mockUsersService.findById.mockResolvedValue({ ...mockUser, refreshTokenVersion: 1 });

      await expect(
        service.refresh({ refreshToken: 'stale-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when token type is not refresh', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'uuid-1', type: 'access', ver: 0 });

      await expect(
        service.refresh({ refreshToken: 'bad-type-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('calls bumpRefreshTokenVersion and returns success', async () => {
      const result = await service.logout('uuid-1');

      expect(mockUsersService.bumpRefreshTokenVersion).toHaveBeenCalledWith('uuid-1');
      expect(result.success).toBe(true);
      expect(result.data.message).toBe('Logged out successfully');
    });
  });
});
