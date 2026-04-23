import { Injectable, Logger } from '@nestjs/common';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { AppConfigService } from '../app-config/app-config.service';

import {
  VideoProcessingJob,
  VIDEO_PROCESSING_JOB_VERSION,
} from '@nexvera/contracts';


@Injectable()
export class VideoProcessingQueueService {
  private readonly logger = new Logger(VideoProcessingQueueService.name);
  private readonly sqsClient: SQSClient;

  constructor(private readonly appConfig: AppConfigService) {
    this.sqsClient = new SQSClient({
      region: this.appConfig.awsRegion,
      credentials: {
        accessKeyId: this.appConfig.awsAccessKey,
        secretAccessKey: this.appConfig.awsSecretKey,
      },
    });
  }

  async publishJob(
    jobData: Omit<VideoProcessingJob, 'version' | 'requestedAtUtc'>,
  ): Promise<boolean> {

    const queueUrl = this.appConfig.awsSqsQueueUrl;

    if (!queueUrl) {
      this.logger.warn(
        `AWS_SQS_VIDEO_QUEUE_URL not configured. Job for video ${jobData.videoId} will not be queued.`,
      );
      return false;
    }

    const job: VideoProcessingJob = {
      ...jobData,
      version: VIDEO_PROCESSING_JOB_VERSION,
      requestedAtUtc: new Date().toISOString(),
    };


    try {
      const command = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(job),
        MessageAttributes: {
          jobType: { DataType: 'String', StringValue: 'video-processing' },
          source: { DataType: 'String', StringValue: job.source },
        },
      });

      const result = await this.sqsClient.send(command);
      this.logger.log(
        `Published ${job.source} job for video ${job.videoId} to SQS. MessageId: ${result.MessageId}`,
      );
      return true;
    } catch (err) {
      this.logger.error(
        `Failed to publish job for video ${job.videoId} to SQS: ${err.message}`,
        err.stack,
      );
      return false;
    }
  }
}
