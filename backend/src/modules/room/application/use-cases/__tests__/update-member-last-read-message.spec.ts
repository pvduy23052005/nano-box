import { UpdateMemberLastReadMessageUseCase } from '../update-member-last-read-message';
import { RoomRepositoryAdapter } from '../../ports/room.ports';
import { RoomProps } from '../../../domain/room.type';
import { RoomType, MemberRole, MemberStatus } from '../../../domain/chat.enum';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

const makeMockRoomRepository = (): jest.Mocked<RoomRepositoryAdapter> => ({
  save: jest.fn(),
  findRoomsByUserIdAndStatus: jest.fn(),
  checkRoomExist: jest.fn(),
  findById: jest.fn(),
  updateLastMessageId: jest.fn(),
  updateMemberLastReadMessage: jest.fn(),
});

describe('UpdateMemberLastReadMessageUseCase', () => {
  let useCase: UpdateMemberLastReadMessageUseCase;
  let roomRepository: jest.Mocked<RoomRepositoryAdapter>;

  const roomId = '654321654321654321654321';
  const userId = '123456123456123456123456';
  const messageId = '789101112131415161718192';

  const mockRoom: RoomProps = {
    id: roomId,
    title: 'Test Room',
    typeRoom: RoomType.SINGLE,
    lastMessageId: null,
    avatar: null,
    members: [
      {
        userId: userId,
        role: MemberRole.MEMBER,
        status: MemberStatus.ACCEPTED,
      },
    ],
  };

  beforeEach(() => {
    roomRepository = makeMockRoomRepository();
    useCase = new UpdateMemberLastReadMessageUseCase(roomRepository);
  });

  it('should throw DomainValidationException if room does not exist', async () => {
    roomRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(roomId, userId, messageId)).rejects.toThrow(
      DomainValidationException,
    );
    expect(roomRepository.updateMemberLastReadMessage).not.toHaveBeenCalled();
  });

  it('should throw DomainValidationException if user is not a member of the room', async () => {
    roomRepository.findById.mockResolvedValue({
      ...mockRoom,
      members: [
        {
          userId: 'another-user',
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
      ],
    });

    await expect(useCase.execute(roomId, userId, messageId)).rejects.toThrow(
      DomainValidationException,
    );
    expect(roomRepository.updateMemberLastReadMessage).not.toHaveBeenCalled();
  });

  it('should call roomRepository.updateMemberLastReadMessage and return true when successful', async () => {
    roomRepository.findById.mockResolvedValue(mockRoom);
    roomRepository.updateMemberLastReadMessage.mockResolvedValue(true);

    const result = await useCase.execute(roomId, userId, messageId);

    expect(roomRepository.findById).toHaveBeenCalledWith(roomId);
    expect(roomRepository.updateMemberLastReadMessage).toHaveBeenCalledWith(
      roomId,
      userId,
      messageId,
    );
    expect(result.isSuccess).toBe(true);
    expect(result.memberIds).toEqual([userId]);
  });

  it('should return false if roomRepository returns false', async () => {
    roomRepository.findById.mockResolvedValue(mockRoom);
    roomRepository.updateMemberLastReadMessage.mockResolvedValue(false);

    const result = await useCase.execute(roomId, userId, messageId);

    expect(result.isSuccess).toBe(false);
  });
});
