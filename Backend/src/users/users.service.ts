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
  ): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      passwordHash,
      role,
      emailVerified: false,
      status: 'active',
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateProfile(
    userId: string,
    _dto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // TODO: When the `user_profiles` and `teacher_profiles` tables are added
    //       (per IMPLEMENTATION_PLAN_PART2.md), move non-core fields
    //       (firstName, lastName, bio, country, timezone, language, phone,
    //       avatarUrl) into those entities and wire them here.
    //
    // The `User` entity only carries authentication-level columns (email, role,
    // status, emailVerified). There are currently no fields from UpdateProfileDto
    // that map directly to User, so we return the user as-is until the
    // ProfilesModule is implemented.
    return user;
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
    user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      user.googleId = googleId;
      if (emailVerified) user.emailVerified = true;
      return this.userRepository.save(user);
    }

    // Create brand-new user
    const newUser = this.userRepository.create({
      email,
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
}
