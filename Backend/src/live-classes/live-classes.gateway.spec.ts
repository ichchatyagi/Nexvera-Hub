import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { LiveClassesGateway } from './live-classes.gateway';
import { LiveClassesService } from './live-classes.service';
import { AppConfigService } from '../app-config/app-config.service';
import { LiveClass } from './schemas/live-class.schema';
import { LiveClassMessage } from './schemas/live-class-message.schema';
import { EnrollmentsService } from '../enrollments/enrollments.service';

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
  const mockEnrollmentsService = {
    isActiveCourseEnrollment: jest.fn(),
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
        {
          provide: EnrollmentsService,
          useValue: mockEnrollmentsService,
        },
      ],
    }).compile();

    gateway = module.get<LiveClassesGateway>(LiveClassesGateway);
    jwtService = module.get<JwtService>(JwtService);
    liveClassesService = module.get<LiveClassesService>(LiveClassesService);
    jest.clearAllMocks();
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
      const liveClassId = new Types.ObjectId().toString();
      mockSocket.handshake.query = { token: 'valid-token', liveClassId };
      mockJwtService.verify.mockReturnValue({
        sub: 'user-1',
        role: 'student',
        email: 'test@test.com',
      });
      mockLiveClassesService.findById.mockResolvedValue({
        course_id: new Types.ObjectId(),
        features: { chat_enabled: false, whiteboard_enabled: false },
        status: 'live',
      });

      await gateway.handleConnection(mockSocket);
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'error',
        'INTERACTIVE_FEATURES_DISABLED',
      );
      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
    });

    it('should join room and emit history on success', async () => {
      const liveClassId = new Types.ObjectId().toString();
      mockSocket.handshake.query = { token: 'valid-token', liveClassId };
      mockJwtService.verify.mockReturnValue({
        sub: 'user-1',
        role: 'student',
        email: 'test@test.com',
      });
      mockLiveClassesService.findById.mockResolvedValue({
        course_id: new Types.ObjectId(),
        features: { chat_enabled: true },
        status: 'live',
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(true);

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.join).toHaveBeenCalledWith(liveClassId);
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'chat:history',
        expect.any(Array),
      );
    });

    it('should refuse connection if student is not enrolled', async () => {
      const liveClassId = new Types.ObjectId().toString();
      mockSocket.handshake.query = { token: 'valid-token', liveClassId };
      mockJwtService.verify.mockReturnValue({
        sub: 'user-1',
        role: 'student',
        email: 'test@test.com',
      });
      mockLiveClassesService.findById.mockResolvedValue({
        course_id: new Types.ObjectId(),
        features: { chat_enabled: true },
        status: 'live',
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(false);

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', 'NOT_ENROLLED');
      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
    });
  });

  describe('handleChatMessage', () => {
    let mockSocket: any;
    let mockServer: any;

    beforeEach(() => {
      mockSocket = {
        data: {
          userId: 'user-1',
          userRole: 'student',
          liveClassId: new Types.ObjectId().toString(),
        },
        emit: jest.fn(),
        disconnect: jest.fn(),
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
        course_id: new Types.ObjectId(),
        features: { chat_enabled: true },
        status: 'live',
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(true);

      mockMessageModel.create.mockResolvedValue({
        _id: new Types.ObjectId(),
        user_id: 'user-1',
        user_role: 'student',
        user_name: 'testuser',
        text: 'Hello world',
        created_at: new Date(),
      });

      await gateway.handleChatMessage(mockSocket, dto);

      expect(mockMessageModel.create).toHaveBeenCalled();
      expect(mockServer.to).toHaveBeenCalledWith(mockSocket.data.liveClassId);
      expect(mockServer.emit).toHaveBeenCalledWith(
        'chat:message',
        expect.objectContaining({
          text: 'Hello world',
        }),
      );
    });

    it('should disconnect student if they try to chat but are not enrolled', async () => {
      const dto = { message: 'Attempted chat' };
      mockLiveClassesService.findById.mockResolvedValue({
        course_id: new Types.ObjectId(),
        features: { chat_enabled: true },
        status: 'live',
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(false);

      await gateway.handleChatMessage(mockSocket, dto);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', 'NOT_ENROLLED');
      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
      expect(mockMessageModel.create).not.toHaveBeenCalled();
    });
  });
});
