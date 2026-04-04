import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction } from './entities/transaction.entity';
import { TeacherPayout } from './entities/payout.entity';
import { PaymentsService } from './services/payments.service';
import { PayoutsService } from './services/payouts.service';
import { InstructorEarningsController, PaymentsController } from './payments.controller';
import { AdminTransactionsController } from './admin-transactions.controller';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { Enrollment, EnrollmentSchema } from '../enrollments/schemas/enrollment.schema';
import { AppConfigModule } from '../app-config/app-config.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, TeacherPayout]),
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
    AppConfigModule,
    EnrollmentsModule,
  ],
  controllers: [InstructorEarningsController, PaymentsController, AdminTransactionsController],
  providers: [PaymentsService, PayoutsService],
  exports: [PaymentsService, PayoutsService],
})
export class PaymentsModule {}
