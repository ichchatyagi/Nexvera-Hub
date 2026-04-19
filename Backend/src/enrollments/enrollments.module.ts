import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Enrollment, EnrollmentSchema } from './schemas/enrollment.schema';
import { EnrollmentsService } from './enrollments.service';
import {
  EnrollmentsController,
  AdminEnrollmentsController,
  CompatibilityEnrollmentsController,
} from './enrollments.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
    NotificationsModule,
  ],
  providers: [EnrollmentsService],
  controllers: [
    EnrollmentsController,
    AdminEnrollmentsController,
    CompatibilityEnrollmentsController,
  ],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
