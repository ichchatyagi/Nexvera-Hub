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

@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @Post('course/:id/enroll')
  enrollInCourse(@CurrentUser() user: User, @Param('id') courseId: string) {
    return this.enrollmentsService.enroll(courseId, user.id);
  }

  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @Get('check/:courseId')
  checkEnrollment(
    @CurrentUser() user: User,
    @Param('courseId') courseId: string,
  ) {
    return this.enrollmentsService.checkEnrollment(courseId, user.id);
  }

  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @Get('course/:courseId/progress')
  getEnrollmentProgress(
    @CurrentUser() user: User,
    @Param('courseId') courseId: string,
  ) {
    return this.enrollmentsService.getProgress(courseId, user.id);
  }

  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @Put('course/:courseId/progress')
  updateEnrollmentProgress(
    @CurrentUser() user: User,
    @Param('courseId') courseId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.enrollmentsService.updateProgress(courseId, user.id, dto);
  }

  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @Get('mine')
  getMyEnrollments(@CurrentUser() user: User) {
    return this.enrollmentsService.getEnrolledCourses(user.id);
  }
}
