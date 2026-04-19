import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RateLimiterGuard } from './rate-limiter.guard';
import { AppConfigService } from '../../app-config/app-config.service';

describe('RateLimiterGuard', () => {
  let guard: RateLimiterGuard;
  let mockAppConfig: Partial<AppConfigService>;

  beforeEach(() => {
    mockAppConfig = {
      authRateLimitMax: 3,
      authRateLimitWindowSeconds: 60,
    };
    guard = new RateLimiterGuard(mockAppConfig as AppConfigService);
    // Clear static storage between tests
    (RateLimiterGuard as any).storage.clear();
  });

  const createMockContext = (ip: string, email?: string, forwardedFor?: string): Partial<ExecutionContext> => ({
    switchToHttp: () => ({
      getRequest: () => ({
        ip,
        body: { email },
        headers: forwardedFor ? { 'x-forwarded-for': forwardedFor } : {},
      }),
    }),
  });

  it('allows requests within limit', async () => {
    const context = createMockContext('1.1.1.1');
    for (let i = 0; i < 3; i++) {
      expect(await guard.canActivate(context as ExecutionContext)).toBe(true);
    }
  });

  it('throws HttpException when limit exceeded for IP', async () => {
    const context = createMockContext('1.1.1.1');
    for (let i = 0; i < 3; i++) {
        await guard.canActivate(context as ExecutionContext);
    }
    
    await expect(guard.canActivate(context as ExecutionContext)).rejects.toThrow(
        expect.objectContaining({ status: HttpStatus.TOO_MANY_REQUESTS })
    );
  });

  it('parses the first IP from x-forwarded-for', async () => {
    // 3 requests from "proxy-ip" but with different forwarded first IP
    // Wait, if it takes the first IP from forwarded list, it should group by that.
    const context1 = createMockContext('10.0.0.1', undefined, '1.1.1.1, 10.0.0.2');
    const context2 = createMockContext('10.0.0.1', undefined, ' 1.1.1.1 ');

    await guard.canActivate(context1 as ExecutionContext);
    await guard.canActivate(context2 as ExecutionContext);
    await guard.canActivate(context1 as ExecutionContext);
    
    // 4th hit should fail
    await expect(guard.canActivate(context1 as ExecutionContext)).rejects.toThrow(
        expect.objectContaining({ status: HttpStatus.TOO_MANY_REQUESTS })
    );
  });

  it('throws HttpException when limit exceeded for email', async () => {
    const context1 = createMockContext('1.1.1.1', 'test@example.com');
    const context2 = createMockContext('2.2.2.2', 'test@example.com');

    // Limit is 3
    await guard.canActivate(context1 as ExecutionContext);
    await guard.canActivate(context2 as ExecutionContext);
    await guard.canActivate(context1 as ExecutionContext);

    // 4th hit for the same email should fail even from a different IP
    await expect(guard.canActivate(context2 as ExecutionContext)).rejects.toThrow(
        expect.objectContaining({ status: HttpStatus.TOO_MANY_REQUESTS })
    );
  });
});
