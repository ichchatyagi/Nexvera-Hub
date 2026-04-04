import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { mapUserToResponse } from './dto/user-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: User) {
    return { success: true, data: mapUserToResponse(user) };
  }

  @Put('me')
  async updateMe(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto,
  ) {
    const updated = await this.usersService.updateProfile(user.id, dto);
    return { success: true, data: mapUserToResponse(updated) };
  }

  @Get('teachers')
  async listTeachers() {
    const teachers = await this.usersService.listTeachers();
    return { success: true, data: teachers.map(mapUserToResponse) };
  }

  @Get('teachers/:id')
  async getTeacher(@Param('id') id: string) {
    const teacher = await this.usersService.findById(id);
    return { success: true, data: teacher ? mapUserToResponse(teacher) : null };
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/dashboard')
  async adminDashboard() {
    return { success: true, data: { message: 'Admin dashboard – coming soon' } };
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async adminListUsers(
    @Query('role') role?: UserRole,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const users = await this.usersService.listUsers({ role, status, search });
    return { success: true, data: users.map(mapUserToResponse) };
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  async adminGetUser(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return { success: true, data: mapUserToResponse(user) };
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id/role')
  async adminUpdateRole(
    @Param('id') id: string,
    @Body('role') role: UserRole,
  ) {
    const updated = await this.usersService.updateRole(id, role);
    return { success: true, data: mapUserToResponse(updated) };
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id/status')
  async adminUpdateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const updated = await this.usersService.updateStatus(id, status);
    return { success: true, data: mapUserToResponse(updated) };
  }
}
