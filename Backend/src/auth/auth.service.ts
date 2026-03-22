import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto, GoogleLoginDto } from './dto/auth.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, role } = registerDto;
    // Strictly map roles to prevent privilege escalation
    const userRole = role === UserRole.TEACHER ? UserRole.TEACHER : UserRole.STUDENT;

    const user = await this.usersService.create(
      { email, passwordHash: password, role: userRole },
      { firstName, lastName }
    );
    
    return this.generateTokens(user);
  }

  async googleAuth(googleLoginDto: GoogleLoginDto) {
    // Note: Verification of real Google token logic omitted for brief scaffolding
    const user = await this.usersService.findOrCreateGoogleUser({
      email: googleLoginDto.email,
      googleId: googleLoginDto.googleId,
      firstName: googleLoginDto.firstName,
      lastName: googleLoginDto.lastName,
    });
    
    return this.generateTokens(user);
  }

  async refresh(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException('User no longer exists');
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    // In a stateless JWT system, token invalidation happens client-side or
    // through a Redis blocklist. We stub the logic here.
    return { success: true, message: 'Successfully logged out' };
  }
}
