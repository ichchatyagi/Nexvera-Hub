import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateReviewDto,
  AssignInstructorDto,
} from './dto/course.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // ── Public ──────────────────────────────────────────────────────────────

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  getCourses(@Query() query: any, @CurrentUser() user?: User) {
    return this.coursesService.findAll(
      query,
      user?.id ?? null,
      user?.role ?? null,
    );
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  getCourseBySlug(@Param('slug') slug: string, @CurrentUser() user?: User) {
    return this.coursesService.findBySlug(
      slug,
      user?.id ?? null,
      user?.role ?? null,
    );
  }

  @Get(':id/curriculum')
  @UseGuards(OptionalJwtAuthGuard)
  getCourseCurriculum(@Param('id') id: string, @CurrentUser() user?: User) {
    return this.coursesService.getCurriculum(
      id,
      user?.id ?? null,
      user?.role ?? null,
    );
  }

  @Get(':id/reviews')
  getCourseReviews(@Param('id') id: string, @Query() query: any) {
    return this.coursesService.getReviews(id, query);
  }

  // ── Admin-only Course CRUD ──────────────────────────────────────────────
  // (Nexvera Hub catalog management)

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  createCourse(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  deleteCourse(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/publish')
  publishCourse(@Param('id') id: string, @Body('status') status: string) {
    return this.coursesService.publish(id, status || 'pending_review');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/assign-instructor')
  assignInstructor(@Param('id') id: string, @Body() dto: AssignInstructorDto) {
    return this.coursesService.assignInstructor(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id/instructors/:instructorId')
  unassignInstructor(
    @Param('id') id: string,
    @Param('instructorId') instructorId: string,
  ) {
    return this.coursesService.unassignInstructor(id, instructorId);
  }

  // ── Student / General (JWT required) ───────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @Post(':id/reviews')
  createReview(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.coursesService.createReview(id, user.id, user.role, dto);
  }
}
