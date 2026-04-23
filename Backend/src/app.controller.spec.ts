import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServiceUnavailableException } from '@nestjs/common';

describe('AppController (Health & Readiness)', () => {
  let controller: AppController;
  let service: AppService;

  const mockAppService = {
    getHealth: jest.fn().mockReturnValue({ status: 'ok' }),
    checkReadiness: jest.fn().mockResolvedValue({ postgres: 'up', mongodb: 'up', redis: 'up' }),
    getInfo: jest.fn().mockReturnValue({ version: '1.0.0' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  describe('GET /health', () => {
    it('returns 200 and success:true', () => {
      const result = controller.getHealth();
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('ok');
    });
  });

  describe('GET /health/ready', () => {
    it('returns 200 when all pings succeed', async () => {
      mockAppService.checkReadiness.mockResolvedValueOnce({ postgres: 'up', mongodb: 'up', redis: 'up' });
      
      const result = await controller.getReadiness();
      expect(result.success).toBe(true);
      expect(result.data.postgres).toBe('up');
      expect(result.data.mongodb).toBe('up');
      expect(result.data.redis).toBe('up');
    });

    it('throws 503 when Postgres ping fails', async () => {
      mockAppService.checkReadiness.mockRejectedValueOnce(
        new ServiceUnavailableException({ 
          success: false, 
          data: { postgres: 'down', mongodb: 'up' }, 
          error: 'db down' 
        })
      );
      
      await expect(controller.getReadiness()).rejects.toThrow(ServiceUnavailableException);
    });

    it('throws 503 when Mongo ping fails', async () => {
      mockAppService.checkReadiness.mockRejectedValueOnce(
        new ServiceUnavailableException({ 
          success: false, 
          data: { postgres: 'up', mongodb: 'down' }, 
          error: 'db down' 
        })
      );
      
      await expect(controller.getReadiness()).rejects.toThrow(ServiceUnavailableException);
    });
  });
});
