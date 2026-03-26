import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LiveClassesService } from './live-classes.service';
import { CreateLiveClassDto, UpdateLiveClassDto } from './dto/live-class.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';

@Controller('live-classes')
export class LiveClassesController {
  constructor(private readonly liveClassesService: LiveClassesService) {}

  // =========================================================================
  // Teacher / Admin – Schedule & manage
  // =========================================================================

  /**
   * POST /live-classes
   *
   * Schedules a new live class for a given course.
   * The Agora channel name is auto-generated; the teacher provides scheduling
   * metadata and optional feature flags.
   *
   * Roles: TEACHER, ADMIN
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: User, @Body() dto: CreateLiveClassDto) {
    const data = await this.liveClassesService.create(user.id, dto);
    return { success: true, data };
  }

  /**
   * GET /live-classes/mine
   *
   * Lists all live classes created by the currently authenticated teacher,
   * sorted by scheduled_start descending (newest first).
   *
   * Roles: TEACHER, ADMIN
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Get('mine')
  getMyClasses(@CurrentUser() user: User) {
    return this.liveClassesService.findByTeacher(user.id);
  }

  /**
   * GET /live-classes/course/:courseId
   *
   * Lists upcoming (non-cancelled) live classes for a course in
   * chronological order. Intended for the student course page.
   * Sensitive fields (registered_students, attended_students, recording_uid)
   * are stripped server-side.
   *
   * Roles: Any authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Get('course/:courseId')
  getClassesByCourse(@Param('courseId') courseId: string) {
    return this.liveClassesService.findByCourse(courseId);
  }

  /**
   * GET /live-classes/:id
   *
   * Returns full live class details (teacher dashboard view).
   * Includes participant lists, agora config, recording state, and features.
   *
   * Roles: TEACHER, ADMIN
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    const data = await this.liveClassesService.findById(id);
    return { success: true, data };
  }

  /**
   * PUT /live-classes/:id
   *
   * Updates schedule/metadata for a live class.
   * Only permitted while status === 'scheduled'.
   *
   * Roles: TEACHER (owner), ADMIN
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Put(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateLiveClassDto,
  ) {
    const isAdmin = user.role === UserRole.ADMIN;
    const data = await this.liveClassesService.update(id, user.id, isAdmin, dto);
    return { success: true, data };
  }

  /**
   * POST /live-classes/:id/cancel
   *
   * Marks a live class as 'cancelled'.
   * Only permitted while status === 'scheduled'.
   *
   * Roles: TEACHER (owner), ADMIN
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(@CurrentUser() user: User, @Param('id') id: string) {
    const isAdmin = user.role === UserRole.ADMIN;
    const data = await this.liveClassesService.cancel(id, user.id, isAdmin);
    return { success: true, data };
  }

  // ────────────────────────── Lifecycle ─────────────────────────────────────

  /**
   * POST /live-classes/:id/start
   *
   * Transitions status: scheduled → live.
   * Sets actual_start to the current timestamp.
   *
   * TODO (future): trigger Agora Cloud Recording if recording.enabled.
   * TODO (future): emit 'class:started' WebSocket event via LiveClassesGateway.
   *
   * Roles: TEACHER (owner), ADMIN
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async start(@CurrentUser() user: User, @Param('id') id: string) {
    const isAdmin = user.role === UserRole.ADMIN;
    const data = await this.liveClassesService.start(id, user.id, isAdmin);
    return { success: true, data };
  }

  /**
   * POST /live-classes/:id/end
   *
   * Transitions status: live → ended.
   * Sets actual_end (and actual_start if somehow never set).
   *
   * TODO (future): stop Agora Cloud Recording REST call.
   * TODO (future): emit 'class:ended' WebSocket event via LiveClassesGateway.
   *
   * Roles: TEACHER (owner), ADMIN
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Post(':id/end')
  @HttpCode(HttpStatus.OK)
  async end(@CurrentUser() user: User, @Param('id') id: string) {
    const isAdmin = user.role === UserRole.ADMIN;
    const data = await this.liveClassesService.end(id, user.id, isAdmin);
    return { success: true, data };
  }

  // =========================================================================
  // Student (+ Teacher/Admin allowed for testing)
  // =========================================================================

  /**
   * POST /live-classes/:id/register
   *
   * Registers the current user as a participant.
   * Enforces max_participants cap; duplicate registrations are idempotent.
   *
   * TODO: Verify course enrollment before allowing registration.
   *   See EnrollmentsService – left as TODO to avoid circular dependencies.
   *
   * Roles: STUDENT, TEACHER, ADMIN
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @Post(':id/register')
  @HttpCode(HttpStatus.OK)
  register(@CurrentUser() user: User, @Param('id') id: string) {
    return this.liveClassesService.register(id, user.id);
  }

  /**
   * POST /live-classes/:id/join
   *
   * Verifies access, records attendance, and returns an Agora RTC token +
   * channel metadata needed for the client-side Agora SDK initialisation.
   *
   * The token is short-lived (1 hour). The client should call this endpoint
   * again if the token is about to expire.
   *
   * Roles: STUDENT, TEACHER, ADMIN
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  async join(@CurrentUser() user: User, @Param('id') id: string) {
    const data = await this.liveClassesService.join(id, user.id);
    return { success: true, data };
  }
}
