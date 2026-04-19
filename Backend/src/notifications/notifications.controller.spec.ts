import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GUARDS_METADATA } from '@nestjs/common/constants';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockService = {
    listForUser: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockService,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should have JwtAuthGuard applied at class level', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, NotificationsController);
    expect(guards).toContain(JwtAuthGuard);
  });

  it('GET / should call service with req.user.id', async () => {
    const req = { user: { id: 'u1' } };
    await controller.list(req, 'true', '1', '10');
    expect(service.listForUser).toHaveBeenCalledWith('u1', {
      unread: true,
      page: 1,
      limit: 10,
    });
  });

  it('GET /my alias should also work', async () => {
    const req = { user: { id: 'u1' } };
    await controller.listMy(req, 'true', '1', '10');
    expect(service.listForUser).toHaveBeenCalledWith('u1', {
      unread: true,
      page: 1,
      limit: 10,
    });
  });

  it('POST /:id/read should be idempotent', async () => {
    const req = { user: { id: 'u1' } };
    mockService.markRead.mockResolvedValue({ success: true });
    
    // First call
    const res1 = await controller.markRead(req, 'n1');
    expect(res1.success).toBe(true);
    
    // Second call
    const res2 = await controller.markRead(req, 'n1');
    expect(res2.success).toBe(true);
    
    expect(service.markRead).toHaveBeenCalledTimes(2);
  });

  it('POST /read-all should call service with req.user.id', async () => {
    const req = { user: { id: 'u1' } };
    await controller.markAllRead(req);
    expect(service.markAllRead).toHaveBeenCalledWith('u1');
  });
});
