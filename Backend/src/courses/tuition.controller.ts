import { Controller, Get, Param, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('tuition')
export class TuitionController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get('classes')
  getTuitionClasses(@Query() query: any) {
    return this.coursesService.findTuitionClasses(query);
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
