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
  activateUser: jest.fn(),
  updatePassword: jest.fn(),
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
    it('returns success even if email already exists (no leak)', async () => {
      mockUsersService.create.mockRejectedValue(
        new ConflictException('Email already registered'),
      );
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        status: 'active',
      });

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.STUDENT,
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'Registration successful. Please verify your email.',
      );
    });
  });

  describe('resendVerificationOtp', () => {
    it('returns success even if user not found (no leak)', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const result = await service.resendVerificationOtp('nope@example.com');
      expect(result.success).toBe(true);
      expect(mockUsersService.setVerificationOtp).not.toHaveBeenCalled();
    });

    it('returns success even if account already active (no leak)', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        status: 'active',
      });
      const result = await service.resendVerificationOtp('active@example.com');
      expect(result.success).toBe(true);
      expect(mockUsersService.setVerificationOtp).not.toHaveBeenCalled();
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

  describe('googleAuth', () => {
    it('throws ForbiddenException with safe message when unconfigured', async () => {
      await expect(service.googleAuth('fake-token')).rejects.toThrow(
        'Google OAuth not yet configured',
      );
    });
  });

  describe('OTP replay-safety', () => {
    it('prevents registration OTP reuse by failing on second attempt', async () => {
      // First call (success)
      mockUsersService.findByEmail.mockResolvedValueOnce({
        ...mockUser,
        status: 'pending',
        verificationOtp: 'ABCDE',
        verificationOtpExpiresAt: new Date(Date.now() + 10000),
      });
      // Second call (should fail because OTP is cleared)
      mockUsersService.findByEmail.mockResolvedValueOnce({
        ...mockUser,
        status: 'active', // already verified
        verificationOtp: null,
        verificationOtpExpiresAt: null,
      });
      mockUsersService.activateUser.mockImplementation(async (id) => ({
        ...mockUser,
        id,
        status: 'active',
        emailVerified: true,
        verificationOtp: null,
      }));

      // 1. First attempt succeeds
      await service.verifyRegistrationOtp({ email: 'test@example.com', otp: 'ABCDE' });

      // 2. Second attempt fails
      await expect(
        service.verifyRegistrationOtp({ email: 'test@example.com', otp: 'ABCDE' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('prevents password reset OTP reuse by failing on second attempt', async () => {
      // First call setup
      mockUsersService.findByEmail.mockResolvedValueOnce({
        ...mockUser,
        resetOtp: 'RESE1',
        resetOtpExpiresAt: new Date(Date.now() + 10000),
      });
      // Second call setup
      mockUsersService.findByEmail.mockResolvedValueOnce({
        ...mockUser,
        resetOtp: null,
        resetOtpExpiresAt: null,
      });
      mockUsersService.updatePassword.mockResolvedValue({
        ...mockUser,
        resetOtp: null,
      });

      // 1. First reset succeeds
      await service.resetPassword({
        email: 'test@example.com',
        otp: 'RESE1',
        newPassword: 'new-password-123',
      });

      // 2. Second reset attempt fails
      await expect(
        service.resetPassword({
          email: 'test@example.com',
          otp: 'RESE1',
          newPassword: 'new-password-123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
