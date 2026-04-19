import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('tuition')
export class TuitionController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get('classes')
  @UseGuards(OptionalJwtAuthGuard)
  getTuitionClasses(@Query() query: any, @CurrentUser() user?: User) {
    return this.coursesService.findTuitionClasses(
      query,
      user?.id ?? null,
      user?.role ?? null,
    );
  }

  @Get('classes/:classSlug')
  getTuitionClassBySlug(@Param('classSlug') classSlug: string) {
    return this.coursesService.findTuitionClassBySlug(classSlug);
  }

  @Get('classes/:classId/subjects/:subjectSlug')
  getTuitionSubject(
    @Param('classId') classId: string,
    @Param('subjectSlug') subjectSlug: string,
  ) {
    return this.coursesService.findTuitionSubject(classId, subjectSlug);
  }
}
