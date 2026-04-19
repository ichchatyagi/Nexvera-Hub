import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { RedisService } from '../redis/redis.service';
import { AppConfigService } from '../app-config/app-config.service';

describe('CacheService', () => {
  let service: CacheService;
  let redis: RedisService;
  let mockConfig: any;

  const mockRedisClient = {
    get: jest.fn(),
    set: jest.fn(),
    incr: jest.fn(),
  };

  const mockRedis = {
    getClient: jest.fn().mockReturnValue(mockRedisClient),
  };

  beforeEach(async () => {
    mockConfig = {
      cacheEnabled: true,
      cacheDefaultTtl: 60,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        { provide: RedisService, useValue: mockRedis },
        { provide: AppConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    redis = module.get<RedisService>(RedisService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should get JSON correctly with versioning', async () => {
    mockRedisClient.get.mockImplementation((key: string) => {
      if (key === 'cache:ns:test:v') return '2';
      if (key === 'cache:test:v2:data') return JSON.stringify({ a: 1 });
      return null;
    });

    const result = await service.getJson<any>('test', 'data');
    expect(result).toEqual({ a: 1 });
    expect(mockRedisClient.get).toHaveBeenCalledWith('cache:ns:test:v');
    expect(mockRedisClient.get).toHaveBeenCalledWith('cache:test:v2:data');
  });

  it('should return null if cache is disabled', async () => {
    mockConfig.cacheEnabled = false;
    const result = await service.getJson('test', 'data');
    expect(result).toBeNull();
    expect(mockRedisClient.get).not.toHaveBeenCalled();
  });

  it('should set JSON with default version 1 if namespace version record missing', async () => {
    mockRedisClient.get.mockResolvedValue(null); // No version
    await service.setJson('test', 'data', { b: 2 });
    expect(mockRedisClient.set).toHaveBeenCalledWith(
      'cache:test:v1:data',
      JSON.stringify({ b: 2 }),
      'EX',
      60,
    );
  });

  it('should set JSON using current namespace version', async () => {
    mockRedisClient.get.mockResolvedValue('5');
    await service.setJson('test', 'data', { b: 2 });
    expect(mockRedisClient.set).toHaveBeenCalledWith(
      'cache:test:v5:data',
      JSON.stringify({ b: 2 }),
      'EX',
      60,
    );
  });

  it('should bump namespace by incrementing version key', async () => {
    await service.bumpNamespace('test');
    expect(mockRedisClient.incr).toHaveBeenCalledWith('cache:ns:test:v');
  });

  it('getOrSetJson should return cached data if present', async () => {
    mockRedisClient.get.mockImplementation((key: string) => {
      if (key === 'cache:ns:test:v') return '1';
      if (key === 'cache:test:v1:data') return JSON.stringify({ cached: true });
      return null;
    });
    const loader = jest.fn();

    const result = await service.getOrSetJson('test', 'data', 30, loader);
    expect(result).toEqual({ cached: true });
    expect(loader).not.toHaveBeenCalled();
  });

  it('getOrSetJson should load and save if cache miss', async () => {
    mockRedisClient.get.mockResolvedValue(null);
    const loader = jest.fn().mockResolvedValue({ loaded: true });

    const result = await service.getOrSetJson('test', 'data', 30, loader);
    expect(result).toEqual({ loaded: true });
    expect(loader).toHaveBeenCalled();
    expect(mockRedisClient.set).toHaveBeenCalledWith(
      'cache:test:v1:data',
      JSON.stringify({ loaded: true }),
      'EX',
      30,
    );
  });
});
