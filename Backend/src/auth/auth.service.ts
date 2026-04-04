import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { ContactService } from '../contact/contact.service';
import { AppConfigService } from '../app-config/app-config.service';
import { User, UserRole } from '../users/entities/user.entity';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, VerifyOtpDto } from './dto/auth.dto';
import { mapUserToResponse } from '../users/dto/user-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly appConfigService: AppConfigService,
    private readonly contactService: ContactService,
  ) {}

  // -----------------------------------------------------------------------
  // Token helpers
  // -----------------------------------------------------------------------

  private buildTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Cast expiresIn to `any` because @nestjs/jwt v11 uses the `ms` StringValue
    // type which doesn't accept plain strings at compile time without the library.
    const accessToken = this.jwtService.sign(payload, {
      secret: this.appConfigService.jwtSecret,
      expiresIn: this.appConfigService.jwtExpiration as any,
    });

    // Refresh token lives longer; it will be verified separately.
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' } as any,
      {
        secret: this.appConfigService.jwtSecret,
        expiresIn: '7d' as any,
      },
    );

    return { accessToken, refreshToken };
  }

  // -----------------------------------------------------------------------
  // register
  // -----------------------------------------------------------------------

  async register(dto: RegisterDto) {
    // Restrict self-registration to student/teacher only.
    // The DTO is already typed as UserRole.STUDENT | UserRole.TEACHER but we
    // guard at runtime as well for defence-in-depth.
    const role: UserRole = (dto.role as UserRole) ?? UserRole.STUDENT;
    if (([UserRole.ADMIN, UserRole.MODERATOR] as UserRole[]).includes(role)) {
      throw new ForbiddenException(
        'Cannot self-register with admin or moderator role',
      );
    }

    const user = await this.usersService.create(
      dto.email,
      dto.password,
      role,
      dto.name,
    );

    // Generate Verification OTP
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let otp = '';
    for (let i = 0; i < 5; i++) {
      otp += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await this.usersService.setVerificationOtp(user.email, otp, expiresAt);

    // Send Verification Email
    const displayName = user.name || user.email.split('@')[0];
    this.contactService.sendVerificationEmail(user.email, displayName, otp).catch((err) => {
      console.error('Failed to send verification email:', err);
    });

    return {
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: { 
        user: { email: user.email, name: user.name, status: user.status },
        isVerified: false 
      },
    };
  }

  // -----------------------------------------------------------------------
  // login
  // -----------------------------------------------------------------------

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'pending' || !user.emailVerified) {
      return {
        success: false,
        statusCode: 403,
        message: 'Account not verified. Please verify your email.',
        data: { email: user.email, isVerified: false }
      };
    }

    const tokens = this.buildTokens(user);

    // Send Login Email (Async)
    console.log('Login success, initiating login email...');
    const displayName = user.name || user.email.split('@')[0];
    this.contactService.sendLoginEmail(user.email, displayName).catch((err) => {
      console.error('Failed to send login email:', err);
    });

    return {
      success: true,
      data: { user: mapUserToResponse(user), ...tokens },
    };
  }

  // -----------------------------------------------------------------------
  // Google auth (stub — real token verification is a TODO)
  // -----------------------------------------------------------------------

  async googleAuth(idToken: string) {
    // TODO: verify Google ID token with google-auth-library, extract profile
    // For now surface a meaningful error so the frontend knows to call back.
    throw new ForbiddenException(
      'Google OAuth not yet configured — please use email/password login',
    );
  }

  // -----------------------------------------------------------------------
  // refresh
  // -----------------------------------------------------------------------

  async refresh(dto: RefreshTokenDto) {
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.appConfigService.jwtSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Token is not a refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = this.buildTokens(user);
    return { success: true, data: tokens };
  }

  // -----------------------------------------------------------------------
  // logout (stub — ready for future token blacklist)
  // -----------------------------------------------------------------------

  async logout(_userId: string) {
    // TODO: add refreshToken to a blacklist (Redis) to invalidate it
    return { success: true, data: { message: 'Logged out successfully' } };
  }

  // -----------------------------------------------------------------------
  // forgot / reset password (stubs)
  // -----------------------------------------------------------------------

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    // Even if user not found, we return success to prevent email enumeration
    if (!user) {
      return {
        success: true,
        data: { message: 'If this email exists, a reset code has been sent' },
      };
    }

    // Generate 5-character alphanumeric OTP in uppercase
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars
    let otp = '';
    for (let i = 0; i < 5; i++) {
      otp += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.usersService.setResetOtp(user.email, otp, expiresAt);

    // Send OTP Email
    const displayName = user.name || user.email.split('@')[0];
    this.contactService.sendOtpEmail(user.email, displayName, otp).catch((err) => {
      console.error('Failed to send OTP email:', err);
    });

    return {
      success: true,
      data: { message: 'If this email exists, a reset code has been sent' },
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.resetOtp || !user.resetOtpExpiresAt) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    if (new Date() > user.resetOtpExpiresAt) {
      throw new UnauthorizedException('OTP has expired');
    }

    if (user.resetOtp.toUpperCase() !== dto.otp.toUpperCase()) {
      throw new UnauthorizedException('Invalid OTP');
    }

    return {
      success: true,
      data: { message: 'OTP verified successfully' },
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.resetOtp || !user.resetOtpExpiresAt) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    if (new Date() > user.resetOtpExpiresAt) {
      throw new UnauthorizedException('OTP has expired');
    }

    if (user.resetOtp.toUpperCase() !== dto.otp.toUpperCase()) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.updatePassword(user.id, passwordHash);

    return {
      success: true,
      data: { message: 'Password has been reset successfully' },
    };
  }

  async verifyRegistrationOtp(dto: VerifyOtpDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || user.status !== 'pending' || !user.verificationOtp || !user.verificationOtpExpiresAt) {
      throw new UnauthorizedException('Invalid verification request');
    }

    if (new Date() > user.verificationOtpExpiresAt) {
      throw new UnauthorizedException('Verification code has expired');
    }

    if (user.verificationOtp.toUpperCase() !== dto.otp.toUpperCase()) {
      throw new UnauthorizedException('Invalid verification code');
    }

    const updatedUser = await this.usersService.activateUser(user.id);
    const tokens = this.buildTokens(updatedUser);

    // Send Welcome Email now that they are verified
    console.log('Email verified, initiating welcome email...');
    const displayName = updatedUser.name || updatedUser.email.split('@')[0];
    this.contactService.sendSignupEmail(updatedUser.email, displayName).catch((err) => {
      console.error('Failed to send signup email:', err);
    });

    return {
      success: true,
      message: 'Account verified successfully!',
      data: { user: mapUserToResponse(updatedUser), ...tokens },
    };
  }

  async resendVerificationOtp(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.status !== 'pending') {
      throw new BadRequestException('Verification not required for this account');
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let otp = '';
    for (let i = 0; i < 5; i++) {
      otp += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.usersService.setVerificationOtp(user.email, otp, expiresAt);
    const displayName = user.name || user.email.split('@')[0];
    await this.contactService.sendVerificationEmail(user.email, displayName, otp);

    return {
      success: true,
      message: 'New verification code sent!',
    };
  }

  async verifyEmail(_token: string) {
    // Legacy support for token-based verification if needed
    return { success: true, data: { message: 'Email verification — use OTP portal' } };
  }
}
