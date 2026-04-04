import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from './schemas/course.schema';
import { Review, ReviewSchema } from './schemas/review.schema';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TeacherCoursesController } from './teacher-courses.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  providers: [CoursesService],
  controllers: [CoursesController, TeacherCoursesController],
  exports: [CoursesService],
})
export class CoursesModule {}
