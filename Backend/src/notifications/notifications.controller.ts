import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Get()
  async list(
    @Req() req: any,
    @Query('unread') unread: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.notificationsService.listForUser(req.user.id, {
      unread: unread === 'true',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('my')
  async listMy(
    @Req() req: any,
    @Query('unread') unread: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.list(req, unread, page, limit);
  }

  @Post(':id/read')
  async markRead(@Req() req: any, @Param('id') id: string) {
    return this.notificationsService.markRead(req.user.id, id);
  }

  @Post('read-all')
  async markAllRead(@Req() req: any) {
    return this.notificationsService.markAllRead(req.user.id);
  }
}
