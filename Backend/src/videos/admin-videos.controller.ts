import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video, VideoDocument } from './schemas/video.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('admin/videos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminVideosController {
  constructor(
    @InjectModel(Video.name) private readonly videoModel: Model<VideoDocument>,
  ) {}

  /**
   * GET /admin/videos/pipeline/failures
   *
   * Lists video pipeline failures for administrative monitoring.
   * Allows filtering by status and age.
   */
  @Get('pipeline/failures')
  async getFailures(
    @Query('status') status = 'failed',
    @Query('olderThanMinutes') olderThanMinutes?: string,
    @Query('limit') limit = '50',
  ) {
    const query: any = { 'processed.status': status };

    if (olderThanMinutes) {
      const minutes = parseInt(olderThanMinutes, 10);
      if (!isNaN(minutes)) {
        const date = new Date();
        date.setMinutes(date.getMinutes() - minutes);
        query.updated_at = { $lt: date };
      }
    }

    const items = await this.videoModel
      .find(query)
      .sort({ updated_at: -1 })
      .limit(parseInt(limit, 10))
      .select({
        _id: 1,
        course_id: 1,
        teacher_id: 1,
        'processed.status': 1,
        'processed.error': 1,
        updated_at: 1,
        pipeline_events: { $slice: -1 }, // Return only the last event
      })
      .exec();

    return {
      success: true,
      data: { items },
    };
  }
}
