import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from '../app-config/app-config.service';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly configService: AppConfigService) {}

  onModuleInit() {
    const redisOptions: any = {
      host: this.configService.redisHost,
      port: this.configService.redisPort,
      password: this.configService.redisPassword || undefined,
      db: this.configService.redisDb,
      lazyConnect: true, // We'll manage connection
      enableOfflineQueue: false, // Critical: don't queue commands if Redis is down (avoids hanging health checks)
      maxRetriesPerRequest: 0,   // Fail fast instead of retrying indefinitely
      connectTimeout: 1000,      // 1s connection timeout
    };

    if (this.configService.redisTls) {
      redisOptions.tls = {};
    }

    this.client = new Redis(redisOptions);

    this.client.on('connect', () => {
      this.logger.log('Redis client connected');
    });

    this.client.on('error', (err) => {
      // Avoid spamming logs if we expect it to be down in some envs
      if (this.configService.redisRequired) {
        this.logger.error(`Redis client error: ${err.message}`, err.stack);
      } else {
        this.logger.debug(`Redis client error (suppressed): ${err.message}`);
      }
    });

    this.client.on('close', () => {
      if (this.configService.redisRequired) {
        this.logger.warn('Redis client connection closed');
      }
    });

    // Explicitly connect
    this.client.connect().catch((err) => {
      if (this.configService.redisRequired) {
        this.logger.error('Failed to connect to Redis, but Redis is REQUIRED');
      } else {
        this.logger.warn('Failed to connect to Redis, but Redis is NOT required');
      }
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        // quit() sends a QUIT command and waits for response
        await this.client.quit();
      } catch (err) {
        // Fallback to disconnect() which just closes the socket
        this.client.disconnect();
      }
    }
  }

  getClient(): Redis {
    return this.client;
  }

  /**
   * Pings Redis with a deterministic timeout.
   * ioredis is configured with enableOfflineQueue: false, but this extra wrap
   * ensures the health check cannot hang the readiness endpoint.
   */
  async ping(timeoutMs = 500): Promise<boolean> {
    try {
      const pingPromise = this.client.ping().then((res) => res === 'PONG');
      const timeoutPromise = new Promise<boolean>((resolve) =>
        setTimeout(() => resolve(false), timeoutMs),
      );

      return await Promise.race([pingPromise, timeoutPromise]);
    } catch (err) {
      return false;
    }
  }

  /**
   * Atomic rate limit increment using Lua.
   * Returns [currentCount, ttlSeconds]
   */
  async rateLimit(
    key: string,
    windowSeconds: number,
  ): Promise<[number, number]> {
    const script = `
      local count = redis.call("INCR", KEYS[1])
      if count == 1 then
        redis.call("EXPIRE", KEYS[1], ARGV[1])
      end
      local ttl = redis.call("TTL", KEYS[1])
      return {count, ttl}
    `;

    try {
      const result = await this.client.eval(script, 1, key, windowSeconds);
      return result as [number, number];
    } catch (err) {
      if (err instanceof ServiceUnavailableException) throw err;

      this.logger.error(`Rate limit Redis error for key ${key}: ${err.message}`);

      // Prompt 2.1: Fail closed if Redis is required
      if (this.configService.redisRequired) {
        throw new ServiceUnavailableException({
          success: false,
          error: { code: 'REDIS_UNAVAILABLE' },
          message: 'Rate limiting unavailable',
        });
      }

      return [1, windowSeconds]; // Fail open if not required: count 1 (allowed)
    }
  }
}
