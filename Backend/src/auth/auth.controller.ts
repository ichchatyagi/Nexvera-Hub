import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  GoogleAuthDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RateLimiterGuard } from '../common/guards/rate-limiter.guard';
import { RateLimit } from '../common/decorators/rate-limit.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(RateLimiterGuard)
  @RateLimit({ id: 'auth:register', limit: 5, windowSeconds: 60 })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @UseGuards(RateLimiterGuard)
  @RateLimit({ id: 'auth:verify-registration-otp', limit: 10, windowSeconds: 60 })
  @Post('verify-registration-otp')
  verifyRegistrationOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyRegistrationOtp(dto);
  }

  @UseGuards(RateLimiterGuard)
  @RateLimit({ id: 'auth:resend-verification-otp', limit: 3, windowSeconds: 60 })
  @Post('resend-verification-otp')
  resendVerificationOtp(@Body('email') email: string) {
    return this.authService.resendVerificationOtp(email);
  }

  @UseGuards(RateLimiterGuard)
  @RateLimit({ id: 'auth:login', limit: 10, windowSeconds: 60 })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(RateLimiterGuard)
  @RateLimit({ id: 'auth:google', limit: 5, windowSeconds: 60 })
  @Post('google')
  googleAuth(@Body() dto: GoogleAuthDto) {
    return this.authService.googleAuth(dto.idToken);
  }

  @UseGuards(RateLimiterGuard)
  @RateLimit({ id: 'auth:refresh', limit: 20, windowSeconds: 60 })
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: any) {
    return this.authService.logout(req.user.id);
  }

  @UseGuards(RateLimiterGuard)
  @RateLimit({ id: 'auth:forgot-password', limit: 3, windowSeconds: 60 })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @UseGuards(RateLimiterGuard)
  @RateLimit({ id: 'auth:verify-otp', limit: 10, windowSeconds: 60 })
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @UseGuards(RateLimiterGuard)
  @RateLimit({ id: 'auth:reset-password', limit: 5, windowSeconds: 60 })
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('verify-email/:token')
  verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}
