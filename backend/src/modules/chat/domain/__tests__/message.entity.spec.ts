import { MessageEntity } from '../message.entity';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

describe('MessageEntity', () => {
  describe('create', () => {
    it('should create a message entity with content and default fields', () => {
      const message = MessageEntity.create({
        roomId: 'room-1',
        senderId: 'user-1',
        content: 'Hello World',
        senderName: 'Alice',
        senderAvatar: 'https://example.com/avatar.jpg',
      });

      expect(message.getId()).toBeUndefined();
      expect(message.getRoomId()).toBe('room-1');
      expect(message.getSenderId()).toBe('user-1');
      expect(message.getContent()).toBe('Hello World');
      expect(message.getSenderName()).toBe('Alice');
      expect(message.getSenderAvatar()).toBe('https://example.com/avatar.jpg');
      expect(message.getAttachments()).toEqual([]);
      expect(message.getReactions()).toEqual([]);
      expect(message.getReadBy()).toEqual([]);
      expect(message.getIsSystem()).toBe(false);
    });

    it('should create a message with attachments when content is empty', () => {
      const message = MessageEntity.create({
        roomId: 'room-1',
        senderId: 'user-1',
        content: '',
        attachments: ['https://example.com/photo.jpg'],
      });

      expect(message.getContent()).toBe('');
      expect(message.getAttachments()).toEqual([
        'https://example.com/photo.jpg',
      ]);
    });

    it('should set isSystem true when senderId is "system"', () => {
      const message = MessageEntity.create({
        roomId: 'room-1',
        senderId: 'system',
        content: 'User 1 joined room',
      });

      expect(message.getIsSystem()).toBe(true);
    });

    it('should throw DomainValidationException if roomId is empty or whitespace', () => {
      expect(() =>
        MessageEntity.create({
          roomId: '   ',
          senderId: 'user-1',
          content: 'Hello',
        }),
      ).toThrow(DomainValidationException);
    });

    it('should throw DomainValidationException if both content and attachments are empty', () => {
      expect(() =>
        MessageEntity.create({
          roomId: 'room-1',
          senderId: 'user-1',
          content: '',
          attachments: [],
        }),
      ).toThrow(DomainValidationException);
    });

    it('should throw DomainValidationException if content exceeds 5000 characters', () => {
      const longContent = 'a'.repeat(5001);
      expect(() =>
        MessageEntity.create({
          roomId: 'room-1',
          senderId: 'user-1',
          content: longContent,
        }),
      ).toThrow(DomainValidationException);
    });

    it('should trim roomId', () => {
      const message = MessageEntity.create({
        roomId: '  room-123  ',
        senderId: 'user-1',
        content: 'Hello',
      });

      expect(message.getRoomId()).toBe('room-123');
    });
  });

  describe('addReaction', () => {
    let message: MessageEntity;

    beforeEach(() => {
      message = MessageEntity.create({
        roomId: 'room-1',
        senderId: 'user-1',
        content: 'Hello',
      });
    });

    it('should add a new reaction group when user reacts', () => {
      message.addReaction('❤️', 'user-2');

      expect(message.getReactions()).toEqual([
        { emoji: '❤️', userIds: ['user-2'] },
      ]);
    });

    it('should append user to existing reaction group if other users also reacted', () => {
      message.addReaction('❤️', 'user-2');
      message.addReaction('❤️', 'user-3');

      expect(message.getReactions()).toEqual([
        { emoji: '❤️', userIds: ['user-2', 'user-3'] },
      ]);
    });

    it('should toggle off reaction when user taps the same emoji again', () => {
      message.addReaction('❤️', 'user-2');
      expect(message.getReactions()).toHaveLength(1);

      message.addReaction('❤️', 'user-2');
      expect(message.getReactions()).toHaveLength(0);
    });

    it('should switch emoji when user reacts with a different emoji', () => {
      message.addReaction('👍', 'user-2');
      expect(message.getReactions()).toEqual([
        { emoji: '👍', userIds: ['user-2'] },
      ]);

      message.addReaction('❤️', 'user-2');
      expect(message.getReactions()).toEqual([
        { emoji: '❤️', userIds: ['user-2'] },
      ]);
    });

    it('should ignore reaction if emoji or userId is empty', () => {
      message.addReaction('', 'user-2');
      expect(message.getReactions()).toHaveLength(0);

      message.addReaction('👍', '');
      expect(message.getReactions()).toHaveLength(0);
    });

    it('should ignore reaction if emoji exceeds 16 characters', () => {
      message.addReaction('a'.repeat(17), 'user-2');
      expect(message.getReactions()).toHaveLength(0);
    });
  });

  describe('restore and toObject', () => {
    it('should restore message entity and serialize back to object', () => {
      const now = new Date();
      const messageData = {
        id: 'msg-100',
        roomId: 'room-100',
        senderId: 'user-100',
        senderAvatar: 'https://example.com/avatar.jpg',
        senderName: 'John Doe',
        content: 'Restored content',
        attachments: ['https://example.com/file.pdf'],
        reactions: [{ emoji: '🔥', userIds: ['user-200'] }],
        readBy: ['user-100', 'user-200'],
        isSystem: false,
        createdAt: now,
      };

      const entity = MessageEntity.restore(messageData);

      expect(entity.getId()).toBe('msg-100');
      expect(entity.getCreatedAt()).toBe(now);

      const exported = entity.toObject();
      expect(exported).toEqual(messageData);
    });
  });
});
