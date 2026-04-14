import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { LiveClassesGateway } from './live-classes.gateway';
import { LiveClassesService } from './live-classes.service';
import { AppConfigService } from '../app-config/app-config.service';
import { LiveClass } from './schemas/live-class.schema';
import { LiveClassMessage } from './schemas/live-class-message.schema';

describe('LiveClassesGateway', () => {
  let gateway: LiveClassesGateway;
  let jwtService: JwtService;
  let liveClassesService: LiveClassesService;

  const mockLiveClassModel = {};
  const mockMessageModel = {
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
  };
  const mockLiveClassesService = {
    findById: jest.fn(),
  };
  const mockJwtService = {
    verify: jest.fn(),
  };
  const mockAppConfig = {
    jwtSecret: 'test-secret',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiveClassesGateway,
        {
          provide: getModelToken(LiveClass.name),
          useValue: mockLiveClassModel,
        },
        {
          provide: getModelToken(LiveClassMessage.name),
          useValue: mockMessageModel,
        },
        {
          provide: LiveClassesService,
          useValue: mockLiveClassesService,
        },
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

    gateway = module.get<LiveClassesGateway>(LiveClassesGateway);
    jwtService = module.get<JwtService>(JwtService);
    liveClassesService = module.get<LiveClassesService>(LiveClassesService);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    let mockSocket: any;

    beforeEach(() => {
      mockSocket = {
        handshake: { query: {} },
        disconnect: jest.fn(),
        join: jest.fn(),
        emit: jest.fn(),
        data: {},
      };
    });

    it('should disconnect if token is missing', async () => {
      mockSocket.handshake.query = { liveClassId: 'some-id' };
      await gateway.handleConnection(mockSocket);
      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
    });

    it('should disconnect if liveClassId is missing', async () => {
      mockSocket.handshake.query = { token: 'some-token' };
      await gateway.handleConnection(mockSocket);
      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
    });

    it('should disconnect if chat is disabled', async () => {
      mockSocket.handshake.query = { token: 'valid-token', liveClassId: 'valid-id' };
      mockJwtService.verify.mockReturnValue({ sub: 'user-1', role: 'student' });
      mockLiveClassesService.findById.mockResolvedValue({
        features: { chat_enabled: false },
        status: 'live',
      });

      await gateway.handleConnection(mockSocket);
      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
    });

    it('should join room and emit history on success', async () => {
      const liveClassId = new Types.ObjectId().toString();
      mockSocket.handshake.query = { token: 'valid-token', liveClassId };
      mockJwtService.verify.mockReturnValue({ sub: 'user-1', role: 'student' });
      mockLiveClassesService.findById.mockResolvedValue({
        features: { chat_enabled: true },
        status: 'live',
      });

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.join).toHaveBeenCalledWith(liveClassId);
      expect(mockSocket.emit).toHaveBeenCalledWith('chat:history', expect.any(Array));
    });
  });

  describe('handleChatMessage', () => {
    let mockSocket: any;
    let mockServer: any;

    beforeEach(() => {
      mockSocket = {
        data: { userId: 'user-1', userRole: 'student', liveClassId: 'lc-1' },
      };
      mockServer = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };
      gateway.server = mockServer;
    });

    it('should persist and broadcast message', async () => {
      const dto = { message: 'Hello world' };
      mockLiveClassesService.findById.mockResolvedValue({
        features: { chat_enabled: true },
        status: 'live',
      });
      mockMessageModel.create.mockResolvedValue({
        _id: new Types.ObjectId(),
        user_id: 'user-1',
        user_role: 'student',
        user_name: null,
        text: 'Hello world',
        created_at: new Date(),
      });

      await gateway.handleChatMessage(mockSocket, dto);

      expect(mockMessageModel.create).toHaveBeenCalled();
      expect(mockServer.to).toHaveBeenCalledWith('lc-1');
      expect(mockServer.emit).toHaveBeenCalledWith('chat:message', expect.objectContaining({
        text: 'Hello world',
      }));
    });
  });
});
