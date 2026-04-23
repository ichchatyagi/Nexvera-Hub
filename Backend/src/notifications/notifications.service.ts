import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from './schemas/notification.schema';
import { NotificationsGateway } from './notifications.gateway';

export interface CreateNotificationInput {
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly gateway: NotificationsGateway,
  ) {}

  async createNotification(input: CreateNotificationInput): Promise<Notification> {
    const created = await this.notificationModel.create({
      ...input,
      read_at: null,
    });

    const plainNotification = created.toObject();

    // Push to live feed - Best effort, do not crash if emit fails
    try {
      this.gateway.emitToUser(input.user_id, 'notification:new', plainNotification);
    } catch (err) {
      this.logger.error(
        `Failed to emit live notification for user ${input.user_id}: ${err.message}`,
      );
    }

    return plainNotification;
  }

  async listForUser(
    userId: string,
    opts: { unread?: boolean; page?: number; limit?: number } = {},
  ) {
    const { unread, page = 1, limit = 20 } = opts;
    const actualLimit = Math.min(limit, 50);
    const skip = (page - 1) * actualLimit;

    const filters: any = { user_id: userId };
    if (unread) {
      filters.read_at = null;
    }

    const [data, total] = await Promise.all([
      this.notificationModel
        .find(filters)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(actualLimit)
        .lean()
        .exec(),
      this.notificationModel.countDocuments(filters),
    ]);

    return {
      success: true,
      data,
      meta: {
        pagination: {
          page,
          limit: actualLimit,
          total_items: total,
          total_pages: Math.ceil(total / actualLimit),
        },
      },
    };
  }

  async markRead(userId: string, notificationId: string) {
    const result = await this.notificationModel.findOneAndUpdate(
      { _id: notificationId, user_id: userId, read_at: null },
      { $set: { read_at: new Date() } },
      { new: true },
    );

    if (!result) {
      // Check if it exists for this user at all
      const exists = await this.notificationModel.exists({
        _id: notificationId,
        user_id: userId,
      });
      if (!exists) {
        throw new NotFoundException('Notification not found');
      }
      // If it exists but was already read, we just return success (idempotent)
    }

    return { success: true };
  }

  async markAllRead(userId: string) {
    const result = await this.notificationModel.updateMany(
      { user_id: userId, read_at: null },
      { $set: { read_at: new Date() } },
    );

    return {
      success: true,
      data: { updated: result.modifiedCount },
    };
  }

  async getUnreadCount(userId: string) {
    const unreadCount = await this.notificationModel.countDocuments({
      user_id: userId,
      read_at: null,
    });
    return { success: true, data: { unread_count: unreadCount } };
  }
}
