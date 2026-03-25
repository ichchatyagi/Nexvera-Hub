import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
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
}
