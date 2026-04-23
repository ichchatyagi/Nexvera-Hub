import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { RedisModule } from '../redis/redis.module';
import { AppConfigModule } from '../app-config/app-config.module';

@Global()
@Module({
  imports: [RedisModule, AppConfigModule],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
