import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TeacherTuitionService } from './teacher-tuition.service';
import { CreateSectionDto, UpdateSectionDto, CreateLessonDto, UpdateLessonDto } from './dto/curriculum.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';

@Controller('teacher/tuition/subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
export class TeacherTuitionController {
  constructor(private readonly teacherTuitionService: TeacherTuitionService) {}

  @Get()
  getAssignedSubjects(@CurrentUser() user: User) {
    return this.teacherTuitionService.findAssignedSubjects(user.id);
  }

  @Get(':subjectId')
  getTeachingView(@CurrentUser() user: User, @Param('subjectId') subjectId: string) {
    return this.teacherTuitionService.getSubjectTeachingView(subjectId, user.id);
  }

  @Post(':subjectId/sections')
  addSection(
    @CurrentUser() user: User,
    @Param('subjectId') subjectId: string,
    @Body() dto: CreateSectionDto,
  ) {
    return this.teacherTuitionService.addSection(subjectId, user.id, dto);
  }

  @Put(':subjectId/sections/:sectionId')
  updateSection(
    @CurrentUser() user: User,
    @Param('subjectId') subjectId: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.teacherTuitionService.updateSection(subjectId, user.id, sectionId, dto);
  }

  @Post(':subjectId/sections/:sectionId/lessons')
  addLesson(
    @CurrentUser() user: User,
    @Param('subjectId') subjectId: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.teacherTuitionService.addLesson(subjectId, user.id, sectionId, dto);
  }

  @Put(':subjectId/sections/:sectionId/lessons/:lessonId')
  updateLesson(
    @CurrentUser() user: User,
    @Param('subjectId') subjectId: string,
    @Param('sectionId') sectionId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.teacherTuitionService.updateLesson(subjectId, user.id, sectionId, lessonId, dto);
  }

  @Put(':subjectId/publish')
  publishSubject(@CurrentUser() user: User, @Param('subjectId') subjectId: string) {
    return this.teacherTuitionService.publishSubject(subjectId, user.id);
  }
}
