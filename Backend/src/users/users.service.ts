import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    email: string,
    password: string,
    role: UserRole,
    name?: string,
  ): Promise<User> {
    const normalizedEmail = email.toLowerCase();
    const existing = await this.userRepository.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email: normalizedEmail,
      name,
      passwordHash,
      role,
      emailVerified: false,
      status: 'pending',
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email: email.toLowerCase() } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Update fields from DTO
    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.bio !== undefined) user.bio = dto.bio;
    if (dto.country !== undefined) user.country = dto.country;
    if (dto.timezone !== undefined) user.timezone = dto.timezone;
    if (dto.language !== undefined) user.language = dto.language;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;

    // Update role-specific fields
    if (dto.headline !== undefined) user.headline = dto.headline;
    if (dto.expertise !== undefined) user.expertise = dto.expertise;
    if (dto.qualifications !== undefined) user.qualifications = dto.qualifications;
    if (dto.yearsExperience !== undefined) user.yearsExperience = dto.yearsExperience;
    if (dto.hourlyRate !== undefined) user.hourlyRate = dto.hourlyRate;
    if (dto.educationLevel !== undefined) user.educationLevel = dto.educationLevel;
    if (dto.interests !== undefined) user.interests = dto.interests;
    if (dto.learningGoals !== undefined) user.learningGoals = dto.learningGoals;

    // Update name field as well for backward compatibility
    if (dto.firstName || dto.lastName) {
      user.name = `${dto.firstName || ''} ${dto.lastName || ''}`.trim();
    }

    return this.userRepository.save(user);
  }

  async listTeachers(): Promise<User[]> {
    return this.userRepository.find({ where: { role: UserRole.TEACHER, status: 'active' } });
  }

  async findOrCreateGoogleUser(
    googleId: string,
    email: string,
    emailVerified: boolean,
  ): Promise<User> {
    // Try find by googleId first
    let user = await this.userRepository.findOne({ where: { googleId } });
    if (user) return user;

    // Try find by email (link existing account)
    const normalizedEmail = email.toLowerCase();
    user = await this.userRepository.findOne({ where: { email: normalizedEmail } });
    if (user) {
      user.googleId = googleId;
      if (emailVerified) user.emailVerified = true;
      return this.userRepository.save(user);
    }

    // Create brand-new user
    const newUser = this.userRepository.create({
      email: normalizedEmail,
      googleId,
      role: UserRole.STUDENT,
      emailVerified,
      status: 'active',
    });
    return this.userRepository.save(newUser);
  }

  async listUsers(filters: {
    role?: UserRole;
    status?: string;
    search?: string;
  }): Promise<User[]> {
    const where: any = {};

    if (filters.role) where.role = filters.role;
    if (filters.status) where.status = filters.status;
    if (filters.search) where.email = ILike(`%${filters.search}%`);

    return this.userRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async updateRole(userId: string, role: UserRole): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    user.role = role;
    return this.userRepository.save(user);
  }

  async updateStatus(userId: string, status: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const validStatuses = ['active', 'suspended', 'pending'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    user.status = status;
    return this.userRepository.save(user);
  }

  async setResetOtp(email: string, otp: string, expiresAt: Date): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    user.resetOtp = otp;
    user.resetOtpExpiresAt = expiresAt;
    return this.userRepository.save(user);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    user.passwordHash = passwordHash;
    user.resetOtp = null;
    user.resetOtpExpiresAt = null;
    return this.userRepository.save(user);
  }

  async setVerificationOtp(email: string, otp: string, expiresAt: Date): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    user.verificationOtp = otp;
    user.verificationOtpExpiresAt = expiresAt;
    return this.userRepository.save(user);
  }

  async activateUser(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    user.emailVerified = true;
    user.status = 'active';
    user.verificationOtp = null;
    user.verificationOtpExpiresAt = null;
    return this.userRepository.save(user);
  }
}
