import { NotificationRepositoryAdapter } from '../../ports/notification.port';
import { GetNotificationsUseCase } from '../get-notifications.use-case';
import { GetUnreadNotificationCountUseCase } from '../get-unread-count.use-case';
import { MarkNotificationAsReadUseCase } from '../mark-notification-as-read.use-case';
import { MarkAllNotificationsAsReadUseCase } from '../mark-all-notifications-as-read.use-case';
import { CreateNotificationUseCase } from '../create-notification.use-case';
import { NotificationType } from '../../../domain/notification.type';

import { NOTIFICATION_EVENTS } from '../../../presentation/listener/notification.event';

const makeMockNotificationRepository =
  (): jest.Mocked<NotificationRepositoryAdapter> => ({
    save: jest.fn(),
    findById: jest.fn(),
    findByRecipientWithPagination: jest.fn(),
    countUnreadByRecipient: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  });

describe('Notification Use Cases', () => {
  let repository: jest.Mocked<NotificationRepositoryAdapter>;

  beforeEach(() => {
    repository = makeMockNotificationRepository();
  });

  it('should have ROOM_MEMBER_ADDED event defined', () => {
    expect((NOTIFICATION_EVENTS as any).ROOM_MEMBER_ADDED).toBe('room.member_added');
  });

  describe('CreateNotificationUseCase', () => {
    it('should save and return notification for single recipient', async () => {
      const useCase = new CreateNotificationUseCase(repository);
      const mockSaved = {
        id: 'n1',
        recipientId: 'u2',
        senderId: 'u1',
        type: NotificationType.NEW_MESSAGE,
        title: 'Tin nhắn mới',
        content: 'Alo',
        metadata: { roomId: 'r1' },
        isRead: false,
      };

      repository.save.mockResolvedValue(mockSaved);

      const result = await useCase.execute({
        recipientId: 'u2',
        senderId: 'u1',
        type: NotificationType.NEW_MESSAGE,
        title: 'Tin nhắn mới',
        content: 'Alo',
        metadata: { roomId: 'r1' },
      });

      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockSaved);
    });
  });

  describe('GetNotificationsUseCase', () => {
    it('should delegate findByRecipientWithPagination to repository', async () => {
      const useCase = new GetNotificationsUseCase(repository);
      const mockResult = {
        items: [
          {
            id: 'n1',
            recipientId: 'u1',
            senderId: 'u2',
            type: NotificationType.NEW_MESSAGE,
            title: 'Tin nhắn mới',
            content: 'Xin chào',
            metadata: { roomId: 'r1' },
            isRead: false,
          },
        ],
        nextCursor: null,
        hasMore: false,
        unreadCount: 1,
      };

      repository.findByRecipientWithPagination.mockResolvedValue(mockResult);

      const result = await useCase.execute('u1', 10, 'cursor-1');

      expect(repository.findByRecipientWithPagination).toHaveBeenCalledWith({
        recipientId: 'u1',
        limit: 10,
        cursor: 'cursor-1',
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('GetUnreadNotificationCountUseCase', () => {
    it('should delegate countUnreadByRecipient to repository', async () => {
      const useCase = new GetUnreadNotificationCountUseCase(repository);
      repository.countUnreadByRecipient.mockResolvedValue(5);

      const count = await useCase.execute('u1');

      expect(repository.countUnreadByRecipient).toHaveBeenCalledWith('u1');
      expect(count).toBe(5);
    });
  });

  describe('MarkNotificationAsReadUseCase', () => {
    it('should delegate markAsRead to repository', async () => {
      const useCase = new MarkNotificationAsReadUseCase(repository);
      repository.markAsRead.mockResolvedValue(true);

      const success = await useCase.execute('n1', 'u1');

      expect(repository.markAsRead).toHaveBeenCalledWith('n1', 'u1');
      expect(success).toBe(true);
    });
  });

  describe('MarkAllNotificationsAsReadUseCase', () => {
    it('should delegate markAllAsRead to repository', async () => {
      const useCase = new MarkAllNotificationsAsReadUseCase(repository);
      repository.markAllAsRead.mockResolvedValue(true);

      const success = await useCase.execute('u1');

      expect(repository.markAllAsRead).toHaveBeenCalledWith('u1');
      expect(success).toBe(true);
    });
  });
});
