import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { GetMessagesUseCase } from '../get-message.use-case';
import { MessageRepositoryAdapter } from '../../ports/message.port';
import { RoomRepositoryAdapter } from '../../../../room/application/ports/room.ports';
import { MemberRole, MemberStatus } from '../../../../room/domain/chat.enum';
import { MessageType } from '../../../domain/message.type';
import { PaginationResult } from '../../dto/pagination.type';

describe('GetMessagesUseCase', () => {
  let useCase: GetMessagesUseCase;
  let messageRepository: jest.Mocked<MessageRepositoryAdapter>;
  let roomRepository: jest.Mocked<RoomRepositoryAdapter>;

  const roomId = 'room-123';
  const userId = 'user-123';

  beforeEach(() => {
    messageRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
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

    useCase = new GetMessagesUseCase(messageRepository, roomRepository);
  });

  it('should use findRoomMembers(roomId) and succeed if user is member', async () => {
    roomRepository.findRoomMembers.mockResolvedValue({
      roomId,
      members: [
        {
          userId,
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
      ],
    });

    const mockMessages: PaginationResult<MessageType> = {
      items: [
        {
          id: 'msg-1',
          roomId,
          senderId: userId,
          content: 'Hello',
        },
      ],
      nextCursor: null,
      hasMore: false,
    };
    messageRepository.findAll.mockResolvedValue(mockMessages);

    const result = await useCase.execute(roomId, userId);

    expect(roomRepository.findRoomMembers).toHaveBeenCalledWith(roomId);
    expect(messageRepository.findAll).toHaveBeenCalledWith({
      roomId,
      cursor: undefined,
      limit: undefined,
    });
    expect(result).toBe(mockMessages);
  });

  it('should throw DomainValidationException if room does not exist via findRoomMembers', async () => {
    roomRepository.findRoomMembers.mockResolvedValue(null);

    await expect(useCase.execute(roomId, userId)).rejects.toThrow(
      DomainValidationException,
    );
    expect(messageRepository.findAll).not.toHaveBeenCalled();
  });

  it('should throw DomainValidationException if user is not in room members', async () => {
    roomRepository.findRoomMembers.mockResolvedValue({
      roomId,
      members: [
        {
          userId: 'other-user',
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
      ],
    });

    await expect(useCase.execute(roomId, userId)).rejects.toThrow(
      DomainValidationException,
    );
    expect(messageRepository.findAll).not.toHaveBeenCalled();
  });

  it('should allow reading messages if user status is WAITTING', async () => {
    roomRepository.findRoomMembers.mockResolvedValue({
      roomId,
      members: [
        {
          userId,
          role: MemberRole.MEMBER,
          status: MemberStatus.WAITTING,
        },
      ],
    });

    const mockMessages: PaginationResult<MessageType> = {
      items: [],
      nextCursor: null,
      hasMore: false,
    };
    messageRepository.findAll.mockResolvedValue(mockMessages);

    const result = await useCase.execute(roomId, userId);
    expect(result).toBe(mockMessages);
  });

  it('should throw DomainValidationException if user status is REFUSED', async () => {
    roomRepository.findRoomMembers.mockResolvedValue({
      roomId,
      members: [
        {
          userId,
          role: MemberRole.MEMBER,
          status: MemberStatus.REFUSED,
        },
      ],
    });

    await expect(useCase.execute(roomId, userId)).rejects.toThrow(
      DomainValidationException,
    );
    expect(messageRepository.findAll).not.toHaveBeenCalled();
  });
});
