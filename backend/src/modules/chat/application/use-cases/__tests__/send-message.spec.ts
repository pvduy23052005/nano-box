import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { MemberRole, MemberStatus } from '../../../../room/domain/chat.enum';
import { RoomRepositoryAdapter } from '../../../../room/application/ports/room.ports';
import { MessageRepositoryAdapter } from '../../ports/message.port';
import { SendMessageUseCase } from '../send-message.use-case';

describe('SendMessageUseCase', () => {
  let sendMessageUseCase: SendMessageUseCase;
  let messageRepository: jest.Mocked<MessageRepositoryAdapter>;
  let roomRepository: jest.Mocked<RoomRepositoryAdapter>;

  beforeEach(() => {
    messageRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
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

    sendMessageUseCase = new SendMessageUseCase(
      messageRepository,
      roomRepository,
    );
  });

  it('should throw DomainValidationException if room does not exist', async () => {
    roomRepository.findRoomMembersWithProfile.mockResolvedValue(null);

    await expect(
      sendMessageUseCase.execute({
        roomId: 'room-1',
        senderId: 'user-1',
        content: 'Hello',
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('should throw DomainValidationException if sender is not a member of the room', async () => {
    roomRepository.findRoomMembersWithProfile.mockResolvedValue({
      roomId: 'room-1',
      members: [
        {
          userId: 'user-2',
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
        {
          userId: 'user-3',
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
      ],
    });

    await expect(
      sendMessageUseCase.execute({
        roomId: 'room-1',
        senderId: 'user-1',
        content: 'Hello',
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('should save message and return SendMessageOutputDto with memberIds', async () => {
    roomRepository.findRoomMembersWithProfile.mockResolvedValue({
      roomId: 'room-1',
      members: [
        {
          userId: 'user-1',
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
        {
          userId: 'user-2',
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
      ],
    });

    const mockSavedMessage = {
      id: 'msg-1',
      roomId: 'room-1',
      senderId: 'user-1',
      content: 'Hello world',
      attachments: [],
      readBy: [],
    };

    messageRepository.save.mockResolvedValue(mockSavedMessage);

    const result = await sendMessageUseCase.execute({
      roomId: 'room-1',
      senderId: 'user-1',
      content: 'Hello world',
    });

    expect(roomRepository.findRoomMembersWithProfile).toHaveBeenCalledWith(
      'room-1',
    );
    expect(result).toEqual({
      message: mockSavedMessage,
      memberIds: ['user-1', 'user-2'],
    });
    expect(messageRepository.save).toHaveBeenCalledTimes(1);
    expect(roomRepository.updateLastMessageId).toHaveBeenCalledWith(
      'room-1',
      'msg-1',
    );
  });

  it('should take senderAvatar and senderName from room member', async () => {
    roomRepository.findRoomMembersWithProfile.mockResolvedValue({
      roomId: 'room-1',
      members: [
        {
          userId: 'user-1',
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
          name: 'User One',
          avatar: 'https://example.com/avatar.jpg',
        },
      ],
    });

    const mockSavedMessage = {
      id: 'msg-2',
      roomId: 'room-1',
      senderId: 'user-1',
      senderAvatar: 'https://example.com/avatar.jpg',
      senderName: 'User One',
      content: 'Hello with avatar',
      attachments: [],
      readBy: [],
    };

    messageRepository.save.mockResolvedValue(mockSavedMessage);

    const result = await sendMessageUseCase.execute({
      roomId: 'room-1',
      senderId: 'user-1',
      senderAvatar: 'https://spoofed.com/fake.jpg',
      senderName: 'Fake Name',
      content: 'Hello with avatar',
    });

    expect(result.message.senderAvatar).toBe('https://example.com/avatar.jpg');
    expect(result.message.senderName).toBe('User One');
  });
});
