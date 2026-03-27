import { Injectable } from '@nestjs/common';
import { AppConfigService } from './app-config/app-config.service';
import * as process from 'process';

@Injectable()
export class AppService {
  constructor(private appConfigService: AppConfigService) {}

  getHealth(): any {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: this.appConfigService.environment,
    };
  }

  getInfo(): any {
    return {
      name: 'Nexvera Hub API',
      version: '1.0.0', // Eventually load from package.json or config
      environment: this.appConfigService.environment,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
