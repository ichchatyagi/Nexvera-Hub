import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { Notification, NotificationType } from './schemas/notification.schema';
import { NotFoundException } from '@nestjs/common';

const mockNotificationModel = {
  create: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  findOneAndUpdate: jest.fn(),
  exists: jest.fn(),
  updateMany: jest.fn(),
};

const mockGateway = {
  emitToUser: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getModelToken(Notification.name),
          useValue: mockNotificationModel,
        },
        {
          provide: NotificationsGateway,
          useValue: mockGateway,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create a notification and emit to gateway', async () => {
      const input = {
        user_id: 'u1',
        type: NotificationType.PAYMENT_CONFIRMED,
        title: 'Title',
        body: 'Body',
      };
      
      const mockCreated = {
        toObject: jest.fn().mockReturnValue({ _id: 'n1', ...input, read_at: null }),
      };
      mockNotificationModel.create.mockResolvedValue(mockCreated);

      const result = await service.createNotification(input);

      expect(result._id).toBe('n1');
      expect(mockNotificationModel.create).toHaveBeenCalledWith({
        ...input,
        read_at: null,
      });
      expect(mockGateway.emitToUser).toHaveBeenCalledWith('u1', 'notification:new', expect.any(Object));
    });
  });

  describe('listForUser', () => {
    it('should list notifications with correct filters and pagination', async () => {
      const mockData = [{ _id: 'n1', title: 'N1' }];
      mockNotificationModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      });
      mockNotificationModel.countDocuments.mockResolvedValue(1);

      const result = await service.listForUser('u1', { unread: true, page: 2, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(mockNotificationModel.find).toHaveBeenCalledWith({
        user_id: 'u1',
        read_at: null,
      });
      expect(result.meta.pagination.page).toBe(2);
      expect(result.meta.pagination.limit).toBe(10);
    });
  });

  describe('markRead', () => {
    it('should mark notification as read identifying by user_id', async () => {
      mockNotificationModel.findOneAndUpdate.mockResolvedValue({ _id: 'n1' });

      const result = await service.markRead('u1', 'n1');

      expect(result.success).toBe(true);
      expect(mockNotificationModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'n1', user_id: 'u1', read_at: null },
        { $set: { read_at: expect.any(Date) } },
        { new: true },
      );
    });

    it('should throw NotFoundException if notification does not exist for user', async () => {
      mockNotificationModel.findOneAndUpdate.mockResolvedValue(null);
      mockNotificationModel.exists.mockResolvedValue(false);

      await expect(service.markRead('u1', 'n1')).rejects.toThrow(NotFoundException);
    });

    it('should return success if already read (idempotent)', async () => {
      mockNotificationModel.findOneAndUpdate.mockResolvedValue(null);
      mockNotificationModel.exists.mockResolvedValue(true);

      const result = await service.markRead('u1', 'n1');
      expect(result.success).toBe(true);
    });
  });

  describe('markAllRead', () => {
    it('should mark all unread notifications as read for user', async () => {
      mockNotificationModel.updateMany.mockResolvedValue({ modifiedCount: 5 });

      const result = await service.markAllRead('u1');

      expect(result.success).toBe(true);
      expect(result.data.updated).toBe(5);
      expect(mockNotificationModel.updateMany).toHaveBeenCalledWith(
        { user_id: 'u1', read_at: null },
        { $set: { read_at: expect.any(Date) } },
      );
    });
  });
});
