import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './schemas/video.schema';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { AppConfigModule } from '../app-config/app-config.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Video.name, schema: VideoSchema },
    ]),
    // AppConfigService is used inside VideosService for S3 bucket + CDN domain config
    AppConfigModule,
  ],
  providers: [VideosService],
  controllers: [VideosController],
  exports: [VideosService],
})
export class VideosModule {}
