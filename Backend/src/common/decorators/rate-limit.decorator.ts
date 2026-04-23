import { SetMetadata } from '@nestjs/common';

export interface RateLimitOptions {
  id: string;
  limit: number;
  windowSeconds: number;
}

export const RATE_LIMIT_KEY = 'rate_limit';
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);
