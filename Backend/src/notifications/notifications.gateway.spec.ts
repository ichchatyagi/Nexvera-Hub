import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './notifications.gateway';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../app-config/app-config.service';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockAppConfig = {
    jwtSecret: 'test-secret',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AppConfigService,
          useValue: mockAppConfig,
        },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('emitToUser', () => {
    it('should not throw if server is not initialized', () => {
      gateway.server = undefined as any;
      expect(() => {
        gateway.emitToUser('u1', 'event', { data: 1 });
      }).not.toThrow();
    });

    it('should emit to user if server is initialized', () => {
      const mockServer = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };
      gateway.server = mockServer as any;

      gateway.emitToUser('u1', 'event', { data: 1 });

      expect(mockServer.to).toHaveBeenCalledWith('u1');
      expect(mockServer.emit).toHaveBeenCalledWith('event', { data: 1 });
    });
  });

  describe('handleConnection', () => {
    it('should disconnect if no token is provided', async () => {
      const mockSocket = {
        handshake: { query: {} },
        disconnect: jest.fn(),
      };
      await gateway.handleConnection(mockSocket as any);
      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
    });
  });
});
