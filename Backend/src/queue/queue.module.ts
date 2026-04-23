import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppConfigModule } from '../app-config/app-config.module';
import { AppConfigService } from '../app-config/app-config.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (configService: AppConfigService) => ({
        connection: {
          host: configService.redisHost,
          port: configService.redisPort,
          password: configService.redisPassword || undefined,
          db: configService.redisDb,
          tls: configService.redisTls ? {} : undefined,
        },
      }),
      inject: [AppConfigService],
    }),
    BullModule.registerQueue({
      name: 'enrollment-reconcile',
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
