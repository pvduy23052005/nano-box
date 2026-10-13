import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { AddEmojiMessageUseCase } from '../add-emoji-message.use-case';
import { MessageRepositoryAdapter } from '../../ports/message.port';
import { RoomRepositoryAdapter } from '../../../../room/application/ports/room.ports';
import { MessageEntity } from '../../../domain/message.entity';
import {
  MemberRole,
  MemberStatus,
  RoomType,
} from '../../../../room/domain/chat.enum';

describe('AddEmojiMessageUseCase', () => {
  let addEmojiMessageUseCase: AddEmojiMessageUseCase;
  let messageRepository: jest.Mocked<MessageRepositoryAdapter>;
  let roomRepository: jest.Mocked<RoomRepositoryAdapter>;

  const mockRoom = {
    id: 'room-1',
    title: 'Room Test',
    typeRoom: RoomType.SINGLE,
    lastMessageId: null,
    avatar: null,
    members: [
      {
        userId: 'user-1',
        role: MemberRole.ADMIN,
        status: MemberStatus.ACCEPTED,
        lastReadMessageId: null,
        name: 'User 1',
        avatar: 'https://example.com/avatar1.jpg',
      },
      {
        userId: 'user-2',
        role: MemberRole.MEMBER,
        status: MemberStatus.ACCEPTED,
        lastReadMessageId: null,
        name: 'User 2',
        avatar: 'https://example.com/avatar2.jpg',
      },
    ],
  };

  const mockMessageData = {
    id: 'msg-1',
    roomId: 'room-1',
    senderId: 'user-1',
    content: 'Hello world',
    reactions: [],
  };

  beforeEach(() => {
    messageRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    roomRepository = {
      save: jest.fn(),
      findRoomsByUserIdAndStatus: jest.fn(),
      checkRoomExist: jest.fn(),
      findById: jest.fn(),
      updateLastMessageId: jest.fn(),
      updateMemberLastReadMessage: jest.fn(),
      acceptAllMembers: jest.fn(),
      deleteRoom: jest.fn(),
      findRoomMembers: jest.fn(),
      findRoomMembersWithProfile: jest.fn(),
      findRelatedUserIdsByRooms: jest.fn(),
    };

    addEmojiMessageUseCase = new AddEmojiMessageUseCase(
      messageRepository,
      roomRepository,
    );
  });

  it('should throw DomainValidationException if messageId is missing', async () => {
    await expect(
      addEmojiMessageUseCase.execute({
        messageId: '',
        emoji: '👍',
        userId: 'user-1',
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('should throw DomainValidationException if emoji is missing', async () => {
    await expect(
      addEmojiMessageUseCase.execute({
        messageId: 'msg-1',
        emoji: '   ',
        userId: 'user-1',
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('should throw DomainValidationException if userId is missing', async () => {
    await expect(
      addEmojiMessageUseCase.execute({
        messageId: 'msg-1',
        emoji: '👍',
        userId: '',
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('should throw DomainValidationException if message does not exist', async () => {
    messageRepository.findById.mockResolvedValue(null);

    await expect(
      addEmojiMessageUseCase.execute({
        messageId: 'msg-1',
        emoji: '👍',
        userId: 'user-1',
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('should throw DomainValidationException if room does not exist', async () => {
    messageRepository.findById.mockResolvedValue(
      MessageEntity.restore(mockMessageData),
    );
    roomRepository.findRoomMembersWithProfile.mockResolvedValue(null);

    await expect(
      addEmojiMessageUseCase.execute({
        messageId: 'msg-1',
        emoji: '👍',
        userId: 'user-1',
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('should throw DomainValidationException if user is not a member of the room', async () => {
    messageRepository.findById.mockResolvedValue(
      MessageEntity.restore(mockMessageData),
    );
    roomRepository.findRoomMembersWithProfile.mockResolvedValue({
      roomId: 'room-1',
      members: mockRoom.members,
    });

    await expect(
      addEmojiMessageUseCase.execute({
        messageId: 'msg-1',
        emoji: '👍',
        userId: 'non-member-user',
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('should add reaction successfully and return message with memberIds', async () => {
    messageRepository.findById.mockResolvedValue(
      MessageEntity.restore(mockMessageData),
    );
    roomRepository.findRoomMembersWithProfile.mockResolvedValue({
      roomId: 'room-1',
      members: mockRoom.members,
    });
    messageRepository.update.mockImplementation((entity) =>
      Promise.resolve({
        id: entity.getId(),
        roomId: entity.getRoomId(),
        senderId: entity.getSenderId(),
        content: entity.getContent(),
        reactions: entity.getReactions(),
      }),
    );

    const result = await addEmojiMessageUseCase.execute({
      messageId: 'msg-1',
      emoji: '👍',
      userId: 'user-1',
    });

    expect(roomRepository.findRoomMembersWithProfile).toHaveBeenCalledWith(
      'room-1',
    );
    expect(result.memberIds).toEqual(['user-1', 'user-2']);
    expect(result.reactorName).toBe('User 1');
    expect(result.reactorAvatar).toBe('https://example.com/avatar1.jpg');
    expect(result.message.reactions).toEqual([
      { emoji: '👍', userIds: ['user-1'] },
    ]);
    expect(messageRepository.update).toHaveBeenCalledTimes(1);
  });

  it('should toggle reaction off when tapping the same emoji again', async () => {
    messageRepository.findById.mockResolvedValue(
      MessageEntity.restore({
        ...mockMessageData,
        reactions: [{ emoji: '👍', userIds: ['user-1'] }],
      }),
    );
    roomRepository.findRoomMembersWithProfile.mockResolvedValue({
      roomId: 'room-1',
      members: mockRoom.members,
    });
    messageRepository.update.mockImplementation((entity) =>
      Promise.resolve({
        id: entity.getId(),
        roomId: entity.getRoomId(),
        senderId: entity.getSenderId(),
        content: entity.getContent(),
        reactions: entity.getReactions(),
      }),
    );

    const result = await addEmojiMessageUseCase.execute({
      messageId: 'msg-1',
      emoji: '👍',
      userId: 'user-1',
    });

    expect(result.message.reactions).toEqual([]);
    expect(messageRepository.update).toHaveBeenCalledTimes(1);
  });

  it('should switch emoji when user reacts with a different emoji', async () => {
    messageRepository.findById.mockResolvedValue(
      MessageEntity.restore({
        ...mockMessageData,
        reactions: [{ emoji: '👍', userIds: ['user-1'] }],
      }),
    );
    roomRepository.findRoomMembersWithProfile.mockResolvedValue({
      roomId: 'room-1',
      members: mockRoom.members,
    });
    messageRepository.update.mockImplementation((entity) =>
      Promise.resolve({
        id: entity.getId(),
        roomId: entity.getRoomId(),
        senderId: entity.getSenderId(),
        content: entity.getContent(),
        reactions: entity.getReactions(),
      }),
    );

    const result = await addEmojiMessageUseCase.execute({
      messageId: 'msg-1',
      emoji: '❤️',
      userId: 'user-1',
    });

    expect(result.message.reactions).toEqual([
      { emoji: '❤️', userIds: ['user-1'] },
    ]);
    expect(messageRepository.update).toHaveBeenCalledTimes(1);
  });
});
