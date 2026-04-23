import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AppConfigModule } from '../app-config/app-config.module';

@Module({
  imports: [AppConfigModule],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
