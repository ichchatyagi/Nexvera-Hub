import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { UpdateProgressDto } from './dto/enrollment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';

/**
 * COMPATIBILITY CONTROLLER
 * Preserves the old /courses/:id/... routes for enrollments and progress.
 */
@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompatibilityEnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @Post(':id/enroll')
  enrollInCourse(@CurrentUser() user: User, @Param('id') courseId: string) {
    return this.enrollmentsService.enroll(courseId, user.id);
  }

  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @Get(':id/progress')
  getEnrollmentProgress(
    @CurrentUser() user: User,
    @Param('id') courseId: string,
  ) {
    return this.enrollmentsService.getProgress(courseId, user.id);
  }

  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @Put(':id/progress')
  updateEnrollmentProgress(
    @CurrentUser() user: User,
    @Param('id') courseId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.enrollmentsService.updateProgress(courseId, user.id, dto);
  }
}

@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @Get('my-learning')
  getMyLearning(@CurrentUser() user: User) {
    return this.enrollmentsService.findByStudent(user.id);
  }

  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @Post(':id/enroll')
  enrollInCourse(@CurrentUser() user: User, @Param('id') courseId: string) {
    return this.enrollmentsService.enroll(courseId, user.id);
  }

  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @Get(':id/progress')
  getEnrollmentProgress(
    @CurrentUser() user: User,
    @Param('id') courseId: string,
  ) {
    return this.enrollmentsService.getProgress(courseId, user.id);
  }

  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @Put(':id/progress')
  updateEnrollmentProgress(
    @CurrentUser() user: User,
    @Param('id') courseId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.enrollmentsService.updateProgress(courseId, user.id, dto);
  }
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminEnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('courses/:id/enrollments')
  getCourseEnrollments(@Param('id') courseId: string) {
    return this.enrollmentsService.findByCourse(courseId);
  }

  @Get('users/:userId/enrollments')
  getUserEnrollments(@Param('userId') userId: string) {
    return this.enrollmentsService.findByStudent(userId);
  }
}
