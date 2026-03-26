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
import { CreateCourseDto, UpdateCourseDto, CreateReviewDto } from './dto/course.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // ── Public ──────────────────────────────────────────────────────────────

  @Get()
  getCourses(@Query() query: any) {
    return this.coursesService.findAll(query);
  }

  @Get(':slug')
  getCourseBySlug(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }

  @Get(':id/curriculum')
  getCourseCurriculum(@Param('id') id: string) {
    return this.coursesService.getCurriculum(id);
  }

  @Get(':id/reviews')
  getCourseReviews(@Param('id') id: string, @Query() query: any) {
    return this.coursesService.getReviews(id, query);
  }

  // ── Teacher / Admin ──────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Post()
  createCourse(@CurrentUser() user: User, @Body() dto: CreateCourseDto) {
    return this.coursesService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Put(':id')
  updateCourse(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Delete(':id')
  deleteCourse(@CurrentUser() user: User, @Param('id') id: string) {
    return this.coursesService.remove(id, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Post(':id/publish')
  publishCourse(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.coursesService.publish(id, user.id, status || 'pending_review');
  }

  // ── Student (JWT required) ───────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @Post(':id/reviews')
  createReview(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.coursesService.createReview(id, user.id, dto);
  }
}
