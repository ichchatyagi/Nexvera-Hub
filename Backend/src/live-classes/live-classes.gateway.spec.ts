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

    it('should NOT disconnect if features are disabled but class is live', async () => {
      const liveClassId = new Types.ObjectId().toString();
      mockSocket.handshake.query = { token: 'valid-token', liveClassId };
      mockJwtService.verify.mockReturnValue({
        sub: 'user-1',
        role: 'student',
        email: 'test@test.com',
        name: 'Test Student',
      });
      mockLiveClassesService.findById.mockResolvedValue({
        course_id: new Types.ObjectId(),
        features: { chat_enabled: false, whiteboard_enabled: false },
        status: 'live',
      });
      mockEnrollmentsService.isActiveCourseEnrollment.mockResolvedValue(true);

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.disconnect).not.toHaveBeenCalled();
      expect(mockSocket.join).toHaveBeenCalledWith(liveClassId);
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'layout:state',
        expect.any(Object),
      );
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

  describe('handleLayoutUpdate', () => {
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
      };
      mockServer = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };
      gateway.server = mockServer;
    });

    it('should ignore if user is not authorized (student)', async () => {
      const payload = { mode: 'VIDEO_FOCUS' as any };
      await gateway.handleLayoutUpdate(mockSocket, payload);
      expect(mockServer.to).not.toHaveBeenCalled();
    });

    it('should broadcast update if authorized (teacher) and validate/clamp values', async () => {
      mockSocket.data.userRole = 'teacher';
      const liveClassId = mockSocket.data.liveClassId;

      const payload = {
        mode: 'VIDEO_FOCUS' as any,
        video: { x: 1.5, y: -0.5, w: 0.05, h: 2.0 },
      };

      await gateway.handleLayoutUpdate(mockSocket, payload);

      expect(mockServer.to).toHaveBeenCalledWith(liveClassId);
      expect(mockServer.emit).toHaveBeenCalledWith(
        'layout:update',
        expect.objectContaining({
          mode: 'VIDEO_FOCUS',
          video: {
            w: 0.12, // clamped from 0.05 to min 0.12
            h: 1, // clamped from 2.0 to max 1
            x: 1 - 0.12, // clamped 1.5 to 1-w
            y: 0, // clamped -0.5 to 0
          },
          version: 2, // 1 (default) -> 2
          updated_at: expect.any(String),
        }),
      );
    });
  });
});
