import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, GoogleLoginDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const tokens = await this.authService.register(registerDto);
    return { success: true, data: tokens };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const tokens = await this.authService.login(loginDto);
    return { success: true, data: tokens };
  }

  @Post('google')
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    const tokens = await this.authService.googleAuth(googleLoginDto);
    return { success: true, data: tokens };
  }

  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    const tokens = await this.authService.refresh(refreshDto.refreshToken);
    return { success: true, data: tokens };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: User) {
    const result = await this.authService.logout(user.id);
    return result;
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return { success: true, message: `Password reset email stubbed for ${email}` };
  }

  @Post('reset-password')
  async resetPassword(@Body() payload: any) {
    return { success: true, message: 'Password successfully reset stubbed' };
  }

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return { success: true, message: 'Email forcefully verified stub' };
  }
}
