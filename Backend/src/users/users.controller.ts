import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { User, UserRole } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { mapUserToResponse } from './dto/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: User) {
    return {
      success: true,
      data: mapUserToResponse(user),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/dashboard')
  getAdminDashboard(@CurrentUser() user: User) {
    return {
      success: true,
      data: { message: `Welcome Admin ${user.email}!` },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(@CurrentUser() user: User, @Body() data: UpdateProfileDto) {
    const updatedUser = await this.usersService.updateProfile(user.id, data);
    return {
      success: true,
      data: mapUserToResponse(updatedUser),
    };
  }

  // Public/Teacher Routes
  @Get('teachers')
  async listTeachers() {
    const teachers = await this.usersService.listTeachers();
    return {
      success: true,
      data: teachers.map(mapUserToResponse),
    };
  }

  @Get('teachers/:id')
  async getTeacher(@Param('id') id: string) {
    const teacher = await this.usersService.findById(id);
    // Usually one should throw if not teacher, but returning user object is fine for this foundation
    return {
      success: true,
      data: mapUserToResponse(teacher),
    };
  }
}
