import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { AppConfigService } from '../app-config/app-config.service';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly config: AppConfigService,
  ) {}

  private async getNamespaceVersion(namespace: string): Promise<number> {
    const client = this.redis.getClient();
    const version = await client.get(`cache:ns:${namespace}:v`);
    return version ? parseInt(version, 10) : 1;
  }

  /**
   * Invalidates all keys in a namespace by bumping its version number.
   */
  async bumpNamespace(namespace: string): Promise<void> {
    if (!this.config.cacheEnabled) return;
    try {
      const client = this.redis.getClient();
      await client.incr(`cache:ns:${namespace}:v`);
      this.logger.log(`Cache namespace [${namespace}] bumped (invalidated)`);
    } catch (err) {
      this.logger.warn(`Failed to bump namespace [${namespace}]: ${err.message}`);
    }
  }

  private buildKey(namespace: string, version: number, key: string): string {
    return `cache:${namespace}:v${version}:${key}`;
  }

  async getJson<T>(namespace: string, key: string): Promise<T | null> {
    if (!this.config.cacheEnabled) return null;
    try {
      const client = this.redis.getClient();
      const version = await this.getNamespaceVersion(namespace);
      const fullKey = this.buildKey(namespace, version, key);
      const data = await client.get(fullKey);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      this.logger.warn(`Cache get failed for [${namespace}:${key}]: ${err.message}`);
      return null;
    }
  }

  async setJson(
    namespace: string,
    key: string,
    value: any,
    ttlSeconds?: number,
  ): Promise<void> {
    if (!this.config.cacheEnabled) return;
    try {
      const client = this.redis.getClient();
      const version = await this.getNamespaceVersion(namespace);
      const fullKey = this.buildKey(namespace, version, key);
      const ttl = ttlSeconds ?? this.config.cacheDefaultTtl;
      await client.set(fullKey, JSON.stringify(value), 'EX', ttl);
    } catch (err) {
      this.logger.warn(`Cache set failed for [${namespace}:${key}]: ${err.message}`);
    }
  }

  async getOrSetJson<T>(
    namespace: string,
    key: string,
    ttlSeconds: number,
    loaderFn: () => Promise<T>,
  ): Promise<T> {
    if (!this.config.cacheEnabled) return loaderFn();

    const cached = await this.getJson<T>(namespace, key);
    if (cached !== null) {
      return cached;
    }

    const freshData = await loaderFn();
    await this.setJson(namespace, key, freshData, ttlSeconds);
    return freshData;
  }
}
