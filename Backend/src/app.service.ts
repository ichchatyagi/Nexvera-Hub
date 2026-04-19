import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection as InjectTypeORM } from '@nestjs/typeorm';
import { InjectConnection as InjectMongoose } from '@nestjs/mongoose';
import { Connection as TypeORMConnection } from 'typeorm';
import { Connection as MongooseConnection } from 'mongoose';
import { AppConfigService } from './app-config/app-config.service';
import { RedisHealthIndicator } from './redis/redis.health';
import * as process from 'process';

@Injectable()
export class AppService {
  constructor(
    private appConfigService: AppConfigService,
    @InjectTypeORM() private postgresConnection: TypeORMConnection,
    @InjectMongoose() private mongoConnection: MongooseConnection,
    private redisHealth: RedisHealthIndicator,
  ) {}

  getHealth(): any {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: this.appConfigService.environment,
    };
  }

  async checkReadiness(): Promise<any> {
    const status: any = {
      postgres: 'down',
      mongodb: 'down',
      redis: 'down',
    };

    try {
      if (this.postgresConnection.isInitialized) {
        await this.postgresConnection.query('SELECT 1');
        status.postgres = 'up';
      }
    } catch (err) {
      status.postgres = 'down';
    }

    try {
      if (this.mongoConnection.readyState === 1) {
        // Use ping command for active check
        await this.mongoConnection.db.admin().ping();
        status.mongodb = 'up';
      }
    } catch (err) {
      status.mongodb = 'down';
    }

    const redisStatus = await this.redisHealth.isHealthy();
    status.redis = redisStatus.status;

    const allUp =
      status.postgres === 'up' &&
      status.mongodb === 'up' &&
      (redisStatus.status === 'up' || !redisStatus.required);

    if (!allUp) {
      throw new ServiceUnavailableException({
        success: false,
        data: status,
        error: 'One or more required services are unreachable or failing pings',
      });
    }

    return status;
  }

  getInfo(): any {
    return {
      name: 'Nexvera Hub API',
      version: '1.0.0',
      environment: this.appConfigService.environment,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
