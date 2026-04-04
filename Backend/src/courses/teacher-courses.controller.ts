import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateSectionDto, UpdateSectionDto, CreateLessonDto, UpdateLessonDto } from './dto/curriculum.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';

@Controller('teacher/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
export class TeacherCoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  getAssignedCourses(@CurrentUser() user: User) {
    return this.coursesService.findAssignedToTeacher(user.id);
  }

  @Get(':id')
  getTeachingView(@CurrentUser() user: User, @Param('id') id: string) {
    return this.coursesService.getTeacherCourseView(id, user.id);
  }

  @Post(':id/sections')
  addSection(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateSectionDto,
  ) {
    return this.coursesService.addSectionForTeacher(id, user.id, dto);
  }

  @Put(':id/sections/:sectionId')
  updateSection(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.coursesService.updateSectionForTeacher(id, user.id, sectionId, dto);
  }

  @Post(':id/sections/:sectionId/lessons')
  addLesson(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.coursesService.addLessonForTeacher(id, user.id, sectionId, dto);
  }

  @Put(':id/sections/:sectionId/lessons/:lessonId')
  updateLesson(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.coursesService.updateLessonForTeacher(id, user.id, sectionId, lessonId, dto);
  }
}
