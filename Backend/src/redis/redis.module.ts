import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisHealthIndicator } from './redis.health';
import { AppConfigModule } from '../app-config/app-config.module';

@Global()
@Module({
  imports: [AppConfigModule],
  providers: [RedisService, RedisHealthIndicator],
  exports: [RedisService, RedisHealthIndicator],
})
export class RedisModule {}
