import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterGuard } from './rate-limiter.guard';
import { AppConfigService } from '../../app-config/app-config.service';
import { RedisService } from '../../redis/redis.service';

describe('RateLimiterGuard', () => {
  let guard: RateLimiterGuard;
  let mockAppConfig: Partial<AppConfigService>;
  let mockRedis: Partial<RedisService>;
  let mockReflector: Partial<Reflector>;

  beforeEach(() => {
    mockAppConfig = {
      authRateLimitMax: 3,
      authRateLimitWindowSeconds: 60,
    };
    mockRedis = {
      rateLimit: jest.fn().mockResolvedValue([1, 60]),
    };
    mockReflector = {
      get: jest.fn().mockReturnValue(undefined), // default no decorator
    };
    guard = new RateLimiterGuard(
      mockAppConfig as AppConfigService,
      mockRedis as RedisService,
      mockReflector as Reflector,
    );
  });

  const createMockContext = (
    ip: string,
    email?: string,
    forwardedFor?: string,
  ): Partial<ExecutionContext> => {
    const headers = forwardedFor ? { 'x-forwarded-for': forwardedFor } : {};
    const mockResponse = {
      setHeader: jest.fn(),
    };

    return {
      getHandler: () => ({}),
      switchToHttp: () =>
        ({
          getRequest: () => ({
            ip,
            body: { email },
            headers,
          }),
          getResponse: () => mockResponse,
        }) as any,
    };
  };

  it('allows requests within limit', async () => {
    const context = createMockContext('1.1.1.1');
    mockRedis.rateLimit = jest.fn().mockResolvedValue([1, 60]);

    expect(await guard.canActivate(context as ExecutionContext)).toBe(true);
    expect(mockRedis.rateLimit).toHaveBeenCalledWith(
      expect.stringContaining('1.1.1.1'),
      60,
    );
  });

  it('throws 429 and sets headers when limit exceeded', async () => {
    const context = createMockContext('1.1.1.1');
    const mockResponse = context.switchToHttp().getResponse();

    // Redis returns count 4 (which is > limit 3)
    mockRedis.rateLimit = jest.fn().mockResolvedValue([4, 45]);

    await expect(
      guard.canActivate(context as ExecutionContext),
    ).rejects.toThrow(
      new HttpException(
        {
          success: false,
          error: { code: 'RATE_LIMITED' },
          message: 'Too many requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      ),
    );

    expect(mockResponse.setHeader).toHaveBeenCalledWith('Retry-After', '45');
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'X-RateLimit-Limit',
      '3',
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'X-RateLimit-Remaining',
      '0',
    );
  });

  it('honors @RateLimit decorator if present', async () => {
    const context = createMockContext('1.1.1.1');
    mockReflector.get = jest
      .fn()
      .mockReturnValue({ id: 'test', limit: 1, windowSeconds: 10 });

    // First hit allowed
    mockRedis.rateLimit = jest.fn().mockResolvedValue([1, 10]);
    await guard.canActivate(context as ExecutionContext);
    expect(mockRedis.rateLimit).toHaveBeenCalledWith('rl:test:ip:1.1.1.1', 10);

    // Second hit fails
    mockRedis.rateLimit = jest.fn().mockResolvedValue([2, 9]);
    await expect(
      guard.canActivate(context as ExecutionContext),
    ).rejects.toThrow(HttpException);
  });

  it('normalizes email and checks email-based limit', async () => {
    const context = createMockContext('1.1.1.1', '  Test@Example.Com  ');
    mockRedis.rateLimit = jest.fn().mockResolvedValue([1, 60]);

    await guard.canActivate(context as ExecutionContext);

    // Should call Redis twice: once for IP, once for normalized email
    expect(mockRedis.rateLimit).toHaveBeenCalledTimes(2);
    expect(mockRedis.rateLimit).toHaveBeenCalledWith(
      expect.stringContaining('email:test@example.com'),
      60,
    );
  });
});
