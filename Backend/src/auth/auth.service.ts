import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AppConfigService } from '../app-config/app-config.service';
import { User, UserRole } from '../users/entities/user.entity';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { mapUserToResponse } from '../users/dto/user-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly appConfigService: AppConfigService,
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

    const user = await this.usersService.create(dto.email, dto.password, role);
    const tokens = this.buildTokens(user);

    return {
      success: true,
      data: { user: mapUserToResponse(user), ...tokens },
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

    const tokens = this.buildTokens(user);
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

  async forgotPassword(email: string) {
    // TODO: generate reset token, store in DB, send email
    return {
      success: true,
      data: { message: 'If this email exists, a reset link has been sent' },
    };
  }

  async resetPassword(_token: string, _newPassword: string) {
    // TODO: verify reset token from DB, hash newPassword, update user
    return {
      success: true,
      data: { message: 'Password reset — implement token verification' },
    };
  }

  async verifyEmail(_token: string) {
    // TODO: mark user.emailVerified = true based on signed token
    return {
      success: true,
      data: { message: 'Email verification — implement token lookup' },
    };
  }
}
