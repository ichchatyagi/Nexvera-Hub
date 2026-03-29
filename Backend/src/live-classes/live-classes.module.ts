import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LiveClass, LiveClassSchema } from './schemas/live-class.schema';
import { LiveClassesService } from './live-classes.service';
import { LiveClassesController } from './live-classes.controller';
import { AppConfigModule } from '../app-config/app-config.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LiveClass.name, schema: LiveClassSchema },
    ]),
    // AppConfigService is used in LiveClassesService for Agora credentials
    AppConfigModule,
    EnrollmentsModule,
    CoursesModule,
  ],
  providers: [LiveClassesService],
  controllers: [LiveClassesController],
  exports: [LiveClassesService],
})
export class LiveClassesModule {}
