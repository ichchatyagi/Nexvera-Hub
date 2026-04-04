import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Enrollment, EnrollmentSchema } from './schemas/enrollment.schema';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController, AdminEnrollmentsController } from './enrollments.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Enrollment.name, schema: EnrollmentSchema }]),
  ],
  providers: [EnrollmentsService],
  controllers: [EnrollmentsController, AdminEnrollmentsController],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
