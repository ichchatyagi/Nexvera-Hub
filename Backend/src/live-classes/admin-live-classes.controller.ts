import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { LiveClassesService } from './live-classes.service';
import { LiveClassStatus } from './schemas/live-class.schema';

@Controller('admin/live-classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminLiveClassesController {
  constructor(private readonly liveClassesService: LiveClassesService) {}

  @Get()
  async list(
    @Query('status') status?: LiveClassStatus | string,
    @Query('courseId') courseId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const data = await this.liveClassesService.adminFindAll({
      status,
      courseId,
      teacherId,
      fromDate,
      toDate,
    });
    return { success: true, data };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const data = await this.liveClassesService.adminFindOne(id);
    return { success: true, data };
  }
}
