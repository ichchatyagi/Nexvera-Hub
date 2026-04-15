import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('lessons')
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get(':id')
  getLesson(@Param('id') id: string) {
    return this.coursesService.findLessonById(id);
  }
}
