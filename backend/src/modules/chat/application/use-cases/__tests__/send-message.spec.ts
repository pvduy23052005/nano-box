import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { SendMessageUseCase } from '../send-message.use-case';
import { MessageRepositoryAdapter } from '../../ports/message.port';
import { RoomRepositoryAdapter } from '../../../../room/application/ports/room.ports';
import {
  MemberRole,
  MemberStatus,
  RoomType,
} from '../../../../room/domain/chat.enum';

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
    };

    sendMessageUseCase = new SendMessageUseCase(
      messageRepository,
      roomRepository,
    );
  });

  it('should throw DomainValidationException if room does not exist', async () => {
    roomRepository.findById.mockResolvedValue(null);

    await expect(
      sendMessageUseCase.execute({
        roomId: 'room-1',
        senderId: 'user-1',
        content: 'Hello',
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('should throw DomainValidationException if sender is not a member of the room', async () => {
    roomRepository.findById.mockResolvedValue({
      id: 'room-1',
      title: null,
      typeRoom: RoomType.SINGLE,
      lastMessageId: null,
      avatar: null,
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
    roomRepository.findById.mockResolvedValue({
      id: 'room-1',
      title: null,
      typeRoom: RoomType.SINGLE,
      lastMessageId: null,
      avatar: null,
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
});
