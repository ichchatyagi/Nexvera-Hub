import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { AppConfigService } from '../app-config/app-config.service';
import { ServiceUnavailableException } from '@nestjs/common';
import Redis from 'ioredis';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue(undefined),
    ping: jest.fn().mockResolvedValue('PONG'),
    eval: jest.fn(),
  }));
});

describe('RedisService', () => {
  let service: RedisService;
  let configService: Partial<AppConfigService>;
  let mockRedisClient: any;

  beforeEach(async () => {
    configService = {
      redisHost: 'localhost',
      redisPort: 6379,
      redisRequired: false,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        { provide: AppConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    // Directly trigger client creation for testing
    (service as any).onModuleInit();
    mockRedisClient = (service as any).client;
  });

  describe('rateLimit', () => {
    it('fails open when Redis is NOT required', async () => {
      (service as any).configService.redisRequired = false;
      mockRedisClient.eval.mockRejectedValue(new Error('Redis Down'));

      const result = await service.rateLimit('test-key', 60);
      expect(result).toEqual([1, 60]);
    });

    it('fails closed (throws 503) when Redis is REQUIRED', async () => {
      (service as any).configService.redisRequired = true;
      mockRedisClient.eval.mockRejectedValue(new Error('Redis Down'));

      await expect(service.rateLimit('test-key', 60)).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });
});
