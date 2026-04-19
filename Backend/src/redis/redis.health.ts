import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import { AppConfigService } from '../app-config/app-config.service';

@Injectable()
export class RedisHealthIndicator {
  private readonly logger = new Logger(RedisHealthIndicator.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: AppConfigService,
  ) {}

  async isHealthy(): Promise<{ status: string; required: boolean; error?: string }> {
    const isUp = await this.redisService.ping();
    const isRequired = this.configService.redisRequired;

    if (!isUp && isRequired) {
      this.logger.error('Redis health check failed and Redis is REQUIRED');
      return { status: 'down', required: true, error: 'Redis is unreachable' };
    }

    return { 
      status: isUp ? 'up' : 'down', 
      required: isRequired 
    };
  }
}
