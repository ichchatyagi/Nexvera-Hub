import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from './schemas/course.schema';
import { Review, ReviewSchema } from './schemas/review.schema';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TeacherCoursesController } from './teacher-courses.controller';
import { TuitionController } from './tuition.controller';
import { AdminTuitionService } from './admin-tuition.service';
import { AdminTuitionController } from './admin-tuition.controller';
import { TeacherTuitionService } from './teacher-tuition.service';
import { TeacherTuitionController } from './teacher-tuition.controller';
import { LessonsController } from './lessons.controller';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { VideosModule } from '../videos/videos.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
    EnrollmentsModule,
    VideosModule,
  ],
  providers: [CoursesService, AdminTuitionService, TeacherTuitionService],
  controllers: [
    CoursesController,
    TeacherCoursesController,
    TuitionController,
    AdminTuitionController,
    TeacherTuitionController,
    LessonsController,
  ],

  exports: [CoursesService],
})
export class CoursesModule {}
