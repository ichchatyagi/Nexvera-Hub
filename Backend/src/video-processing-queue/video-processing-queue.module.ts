import { Module } from '@nestjs/common';
import { VideoProcessingQueueService } from './video-processing-queue.service';
import { AppConfigModule } from '../app-config/app-config.module';

@Module({
  imports: [AppConfigModule],
  providers: [VideoProcessingQueueService],
  exports: [VideoProcessingQueueService],
})
export class VideoProcessingQueueModule {}
