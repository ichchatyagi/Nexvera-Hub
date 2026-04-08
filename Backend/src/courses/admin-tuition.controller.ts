import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminTuitionService } from './admin-tuition.service';
import {
  AdminCreateTuitionClassDto,
  AdminUpdateTuitionClassDto,
  AdminCreateTuitionSubjectDto,
  AdminUpdateTuitionSubjectDto,
  AdminTuitionPublishDto,
  AdminAssignTuitionInstructorDto,
} from './dto/admin-tuition.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('admin/tuition/classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminTuitionController {
  constructor(private readonly adminTuitionService: AdminTuitionService) {}

  @Post()
  createClass(@Body() dto: AdminCreateTuitionClassDto) {
    return this.adminTuitionService.createClass(dto);
  }

  @Put(':classId')
  updateClass(@Param('classId') classId: string, @Body() dto: AdminUpdateTuitionClassDto) {
    return this.adminTuitionService.updateClass(classId, dto);
  }

  @Post(':classId/publish')
  publishClass(@Param('classId') classId: string, @Body() dto: AdminTuitionPublishDto) {
    return this.adminTuitionService.publishClass(classId, dto);
  }

  @Delete(':classId')
  deleteClass(@Param('classId') classId: string) {
    return this.adminTuitionService.deleteClass(classId);
  }

  @Post(':classId/subjects')
  addSubject(@Param('classId') classId: string, @Body() dto: AdminCreateTuitionSubjectDto) {
    return this.adminTuitionService.addSubject(classId, dto);
  }

  @Put(':classId/subjects/:subjectId')
  updateSubject(
    @Param('classId') classId: string,
    @Param('subjectId') subjectId: string,
    @Body() dto: AdminUpdateTuitionSubjectDto,
  ) {
    return this.adminTuitionService.updateSubject(classId, subjectId, dto);
  }

  @Delete(':classId/subjects/:subjectId')
  removeSubject(@Param('classId') classId: string, @Param('subjectId') subjectId: string) {
    return this.adminTuitionService.removeSubject(classId, subjectId);
  }

  @Post(':classId/subjects/:subjectId/publish')
  publishSubject(
    @Param('classId') classId: string,
    @Param('subjectId') subjectId: string,
    @Body() dto: AdminTuitionPublishDto,
  ) {
    return this.adminTuitionService.publishSubject(classId, subjectId, dto);
  }

  @Post(':classId/subjects/:subjectId/assign-instructor')
  assignInstructor(
    @Param('classId') classId: string,
    @Param('subjectId') subjectId: string,
    @Body() dto: AdminAssignTuitionInstructorDto,
  ) {
    return this.adminTuitionService.assignInstructor(classId, subjectId, dto);
  }

  @Delete(':classId/subjects/:subjectId/instructors/:instructorId')
  unassignInstructor(
    @Param('classId') classId: string,
    @Param('subjectId') subjectId: string,
    @Param('instructorId') instructorId: string,
  ) {
    return this.adminTuitionService.unassignInstructor(classId, subjectId, instructorId);
  }
}
