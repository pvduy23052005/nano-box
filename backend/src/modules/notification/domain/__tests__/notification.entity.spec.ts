import { NotificationEntity } from '../notification.entity';
import { NotificationType } from '../notification.type';

describe('NotificationEntity', () => {
  describe('create', () => {
    it('should create a notification entity with isRead false by default', () => {
      const entity = NotificationEntity.create({
        recipientId: 'recipient-1',
        senderId: 'sender-1',
        senderName: 'Sender Name',
        senderAvatar: 'https://example.com/avatar.jpg',
        type: NotificationType.FRIEND_REQUEST,
        title: 'Lời mời kết bạn',
        content: 'Sender Name đã gửi cho bạn một lời mời kết bạn',
        metadata: {
          referenceId: 'req-1',
          referenceType: 'FRIEND_REQUEST',
        },
      });

      expect(entity.getId()).toBeUndefined();
      expect(entity.getRecipientId()).toBe('recipient-1');
      expect(entity.getSenderId()).toBe('sender-1');
      expect(entity.getSenderName()).toBe('Sender Name');
      expect(entity.getSenderAvatar()).toBe('https://example.com/avatar.jpg');
      expect(entity.getType()).toBe(NotificationType.FRIEND_REQUEST);
      expect(entity.getTitle()).toBe('Lời mời kết bạn');
      expect(entity.getContent()).toBe(
        'Sender Name đã gửi cho bạn một lời mời kết bạn',
      );
      expect(entity.getMetadata()).toEqual({
        referenceId: 'req-1',
        referenceType: 'FRIEND_REQUEST',
      });
      expect(entity.getIsRead()).toBe(false);
      expect(entity.getCreatedAt()).toBeUndefined();
    });
  });

  describe('markAsRead', () => {
    it('should mark an unread notification as read', () => {
      const entity = NotificationEntity.create({
        recipientId: 'recipient-1',
        senderId: 'sender-1',
        type: NotificationType.ROOM_ACTION,
        title: 'Hành động nhóm',
        content: 'Bạn đã được thêm vào nhóm',
        metadata: {},
      });

      expect(entity.getIsRead()).toBe(false);

      entity.markAsRead();

      expect(entity.getIsRead()).toBe(true);
    });
  });

  describe('restore', () => {
    it('should restore a notification entity with all fields including id and createdAt', () => {
      const createdAt = new Date('2026-10-12T10:00:00Z');
      const entity = NotificationEntity.restore({
        id: 'notif-100',
        recipientId: 'recipient-1',
        senderId: 'sender-1',
        senderName: 'Bob',
        senderAvatar: 'https://example.com/bob.jpg',
        type: NotificationType.NEW_MESSAGE,
        title: 'Tin nhắn mới',
        content: 'Bạn có tin nhắn mới',
        metadata: {
          referenceId: 'room-1',
          referenceType: 'ROOM',
        },
        isRead: true,
        createdAt,
      });

      expect(entity.getId()).toBe('notif-100');
      expect(entity.getRecipientId()).toBe('recipient-1');
      expect(entity.getSenderId()).toBe('sender-1');
      expect(entity.getSenderName()).toBe('Bob');
      expect(entity.getSenderAvatar()).toBe('https://example.com/bob.jpg');
      expect(entity.getType()).toBe(NotificationType.NEW_MESSAGE);
      expect(entity.getTitle()).toBe('Tin nhắn mới');
      expect(entity.getContent()).toBe('Bạn có tin nhắn mới');
      expect(entity.getMetadata()).toEqual({
        referenceId: 'room-1',
        referenceType: 'ROOM',
      });
      expect(entity.getIsRead()).toBe(true);
      expect(entity.getCreatedAt()).toBe(createdAt);
    });
  });
});
