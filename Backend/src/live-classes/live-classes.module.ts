import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LiveClass, LiveClassSchema } from './schemas/live-class.schema';
import {
  LiveClassMessage,
  LiveClassMessageSchema,
} from './schemas/live-class-message.schema';
import { LiveClassesGateway } from './live-classes.gateway';
import { LiveClassesService } from './live-classes.service';
import { LiveClassesController } from './live-classes.controller';
import { AdminLiveClassesController } from './admin-live-classes.controller';
import { AppConfigModule } from '../app-config/app-config.module';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { AuthModule } from '../auth/auth.module';
import { VideosModule } from '../videos/videos.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LiveClass.name, schema: LiveClassSchema },
      { name: LiveClassMessage.name, schema: LiveClassMessageSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
    AppConfigModule,
    AuthModule,
    VideosModule,
    EnrollmentsModule,
    NotificationsModule,
  ],
  providers: [LiveClassesService, LiveClassesGateway],
  controllers: [LiveClassesController, AdminLiveClassesController],
  exports: [LiveClassesService],
})
export class LiveClassesModule {}
