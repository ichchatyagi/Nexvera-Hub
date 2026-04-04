import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LiveClass, LiveClassSchema } from './schemas/live-class.schema';
import { LiveClassesService } from './live-classes.service';
import { LiveClassesController } from './live-classes.controller';
import { AdminLiveClassesController } from './admin-live-classes.controller';
import { AppConfigModule } from '../app-config/app-config.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LiveClass.name, schema: LiveClassSchema },
    ]),
    // AppConfigService is used in LiveClassesService for Agora credentials
    AppConfigModule,
  ],
  providers: [LiveClassesService],
  controllers: [LiveClassesController, AdminLiveClassesController],
  exports: [LiveClassesService],
})
export class LiveClassesModule {}

