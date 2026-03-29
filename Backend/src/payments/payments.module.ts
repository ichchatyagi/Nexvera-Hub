import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TeacherPayout } from './entities/teacher-payout.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { AppConfigModule } from '../app-config/app-config.module';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, TeacherPayout]),
    AppConfigModule,
    CoursesModule,
    EnrollmentsModule,
    UsersModule,
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
