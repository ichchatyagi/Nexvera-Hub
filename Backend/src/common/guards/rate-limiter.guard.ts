import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { AppConfigService } from '../../app-config/app-config.service';

interface RateLimitRecord {
  count: number;
  expiresAt: number;
}

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private static storage = new Map<string, RateLimitRecord>();

  constructor(private readonly appConfigService: AppConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    
    // Parse IP: if x-forwarded-for exists, take the first one; else fallback to request.ip
    let ip = request.ip || 'unknown';
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      ip = forwardedStr.split(',')[0].trim() || ip;
    }
    
    const email = request.body?.email || '';
    const now = Date.now();

    // Use configurable values
    const limit = this.appConfigService.authRateLimitMax;
    const ttlMs = this.appConfigService.authRateLimitWindowSeconds * 1000;

    // 1. Check IP-based limit
    this.checkLimit(`ip:${ip}`, now, limit, ttlMs);

    // 2. Check email-based limit if present
    if (email) {
      this.checkLimit(`email:${email}`, now, limit, ttlMs);
    }

    return true;
  }

  private checkLimit(key: string, now: number, limit: number, ttlMs: number) {
    let record = RateLimiterGuard.storage.get(key);

    if (!record || now > record.expiresAt) {
      record = {
        count: 1,
        expiresAt: now + ttlMs,
      };
      RateLimiterGuard.storage.set(key, record);
      return;
    }

    record.count++;

    if (record.count > limit) {
      const retryAfter = Math.ceil((record.expiresAt - now) / 1000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests, please try again later.',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
