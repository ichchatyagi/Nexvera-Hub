import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { TeacherProfile } from './entities/teacher-profile.entity';
import { StudentProfile } from './entities/student-profile.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(UserProfile) private readonly userProfileRepo: Repository<UserProfile>,
    @InjectRepository(TeacherProfile) private readonly teacherProfileRepo: Repository<TeacherProfile>,
    @InjectRepository(StudentProfile) private readonly studentProfileRepo: Repository<StudentProfile>,
  ) {}

  async create(data: Partial<User>, profileData: Partial<UserProfile>): Promise<User> {
    const existing = await this.usersRepo.findOne({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    if (data.passwordHash) {
      data.passwordHash = await bcrypt.hash(data.passwordHash, 10);
    }

    const user = this.usersRepo.create(data);
    const savedUser = await this.usersRepo.save(user);

    const profile = this.userProfileRepo.create({
      ...profileData,
      user_id: savedUser.id,
    });
    await this.userProfileRepo.save(profile);

    if (savedUser.role === UserRole.TEACHER) {
      const teacherProfile = this.teacherProfileRepo.create({ user_id: savedUser.id });
      await this.teacherProfileRepo.save(teacherProfile);
    } else if (savedUser.role === UserRole.STUDENT) {
      const studentProfile = this.studentProfileRepo.create({ user_id: savedUser.id });
      await this.studentProfileRepo.save(studentProfile);
    }

    return this.findById(savedUser.id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: { email },
      relations: ['profile', 'teacherProfile', 'studentProfile'],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { id },
      relations: ['profile', 'teacherProfile', 'studentProfile'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: string, data: Partial<UserProfile>): Promise<User> {
    const profile = await this.userProfileRepo.findOne({ where: { user_id: id } });
    if (!profile) throw new NotFoundException('Profile not found');

    Object.assign(profile, data);
    await this.userProfileRepo.save(profile);
    
    return this.findById(id);
  }

  async findOrCreateGoogleUser(data: { email: string; googleId: string; firstName: string; lastName: string }): Promise<User> {
    let user = await this.usersRepo.findOne({ where: { googleId: data.googleId } });
    
    if (!user) {
      user = await this.usersRepo.findOne({ where: { email: data.email } });
      if (user) {
        user.googleId = data.googleId;
        await this.usersRepo.save(user);
        return this.findById(user.id);
      } else {
        return this.create(
          { email: data.email, googleId: data.googleId, emailVerified: true, role: UserRole.STUDENT },
          { firstName: data.firstName, lastName: data.lastName }
        );
      }
    }
    
    return this.findById(user.id);
  }

  async listTeachers() {
    return this.usersRepo.find({
      where: { role: UserRole.TEACHER },
      relations: ['profile', 'teacherProfile'],
    });
  }
}
