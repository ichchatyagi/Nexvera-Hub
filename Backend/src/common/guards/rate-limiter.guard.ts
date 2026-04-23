import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { AppConfigService } from '../../app-config/app-config.service';
import { RedisService } from '../../redis/redis.service';
import {
  RATE_LIMIT_KEY,
  RateLimitOptions,
} from '../decorators/rate-limit.decorator';

@Injectable()
export class RateLimiterGuard implements CanActivate {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request: Request = http.getRequest();
    const response: Response = http.getResponse();

    // 1. Get Rate Limit configuration from decorator
    const options = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    const limit = options?.limit || this.appConfigService.authRateLimitMax;
    const windowSeconds =
      options?.windowSeconds || this.appConfigService.authRateLimitWindowSeconds;
    const routeId = options?.id || 'default';

    // 2. Identify keys (IP and normalized email)
    let ip = request.ip || 'unknown';
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      ip = forwardedStr.split(',')[0].trim() || ip;
    }

    const email = (request.body?.email || '').toLowerCase().trim();

    // Key format: rl:<routeId>:<type>:<value>
    const keys = [`rl:${routeId}:ip:${ip}`];
    if (email) {
      keys.push(`rl:${routeId}:email:${email}`);
    }

    // 3. Increment and check all applicable keys in Redis
    for (const key of keys) {
      const [count, ttl] = await this.redisService.rateLimit(
        key,
        windowSeconds,
      );

      if (count > limit) {
        // Set standard rate limit headers on the blocked response
        this.setRateLimitHeaders(response, limit, 0, ttl);

        throw new HttpException(
          {
            success: false,
            error: { code: 'RATE_LIMITED' },
            message: 'Too many requests',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    return true;
  }

  private setRateLimitHeaders(
    response: Response,
    limit: number,
    remaining: number,
    ttl: number,
  ) {
    const resetTime = Math.ceil(Date.now() / 1000 + ttl);
    response.setHeader('Retry-After', ttl.toString());
    response.setHeader('X-RateLimit-Limit', limit.toString());
    response.setHeader('X-RateLimit-Remaining', remaining.toString());
    response.setHeader('X-RateLimit-Reset', resetTime.toString());
  }
}
