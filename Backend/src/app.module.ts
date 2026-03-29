import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { VideosModule } from './videos/videos.module';
import { LiveClassesModule } from './live-classes/live-classes.module';
import { PaymentsModule } from './payments/payments.module';
import { SearchModule } from './search/search.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { AppConfigModule } from './app-config/app-config.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProfilesModule,
    CoursesModule,
    EnrollmentsModule,
    VideosModule,
    LiveClassesModule,
    PaymentsModule,
    SearchModule,
    NotificationsModule,
    AnalyticsModule,
    CommonModule,
    DatabaseModule,
    AppConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
