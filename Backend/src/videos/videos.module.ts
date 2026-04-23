import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './schemas/video.schema';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { AdminVideosController } from './admin-videos.controller';
import { AppConfigModule } from '../app-config/app-config.module';

import { VideoProcessingQueueModule } from '../video-processing-queue/video-processing-queue.module';
import {
  LiveClass,
  LiveClassSchema,
} from '../live-classes/schemas/live-class.schema';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AlertsModule } from '../alerts/alerts.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Video.name, schema: VideoSchema },
      { name: LiveClass.name, schema: LiveClassSchema },
    ]),
    AppConfigModule,
    VideoProcessingQueueModule,
    EnrollmentsModule,
    NotificationsModule,
    AlertsModule,
  ],

  providers: [VideosService],
  controllers: [VideosController, AdminVideosController],

  exports: [VideosService],
})
export class VideosModule {}
