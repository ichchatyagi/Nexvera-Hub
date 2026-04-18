import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('lessons')
@UseGuards(OptionalJwtAuthGuard)
export class LessonsController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get(':id')
  getLesson(@Param('id') id: string, @CurrentUser() user?: User) {
    return this.coursesService.findLessonById(
      id,
      user?.id ?? null,
      user?.role ?? null,
    );
  }
}
