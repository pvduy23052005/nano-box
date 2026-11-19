import { GetRoomDetailUseCase } from '../get-room-detail.use-case';
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
  acceptAllMembers: jest.fn(),
});

describe('GetRoomDetailUseCase', () => {
  let useCase: GetRoomDetailUseCase;
  let roomRepository: jest.Mocked<RoomRepositoryAdapter>;

  const currentUserId = '654321654321654321654321';
  const otherUserId = '123456123456123456123456';
  const validRoomId = '65f1234567890abcdef12345';

  const mockRoom: RoomProps = {
    id: validRoomId,
    title: 'Phòng Chat Test',
    typeRoom: RoomType.SINGLE,
    lastMessageId: null,
    avatar: 'http://example.com/avatar.png',
    members: [
      {
        userId: currentUserId,
        role: MemberRole.MEMBER,
        status: MemberStatus.ACCEPTED,
        lastReadMessageId: null,
      },
      {
        userId: otherUserId,
        role: MemberRole.MEMBER,
        status: MemberStatus.ACCEPTED,
        lastReadMessageId: null,
      },
    ],
  };

  beforeEach(() => {
    roomRepository = makeMockRoomRepository();
    useCase = new GetRoomDetailUseCase(roomRepository);
  });

  it('nên ném DomainValidationException nếu roomId không phải là ObjectId hợp lệ', async () => {
    await expect(useCase.execute('invalid-id', currentUserId)).rejects.toThrow(
      DomainValidationException,
    );
  });

  it('nên ném DomainValidationException nếu thành viên có trạng thái REFUSED', async () => {
    const refusedRoom: RoomProps = {
      ...mockRoom,
      members: [
        {
          userId: currentUserId,
          role: MemberRole.MEMBER,
          status: MemberStatus.REFUSED,
        },
      ],
    };
    roomRepository.findById.mockResolvedValue(refusedRoom);

    await expect(useCase.execute(validRoomId, currentUserId)).rejects.toThrow(
      DomainValidationException,
    );
  });

  it('nên trả về chi tiết phòng khi người dùng là thành viên', async () => {
    roomRepository.findById.mockResolvedValue(mockRoom);

    const result = await useCase.execute(validRoomId, currentUserId);

    expect(roomRepository.findById).toHaveBeenCalledWith(
      validRoomId,
      currentUserId,
    );
    expect(result).toEqual(mockRoom);
  });

  it('nên ném DomainValidationException nếu không tìm thấy phòng', async () => {
    roomRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(validRoomId, currentUserId)).rejects.toThrow(
      DomainValidationException,
    );
    expect(roomRepository.findById).toHaveBeenCalledWith(
      validRoomId,
      currentUserId,
    );
  });

  it('nên ném DomainValidationException nếu người dùng không thuộc phòng', async () => {
    const strangerUserId = '999999999999999999999999';
    roomRepository.findById.mockResolvedValue(mockRoom);

    await expect(useCase.execute(validRoomId, strangerUserId)).rejects.toThrow(
      DomainValidationException,
    );
  });
});
