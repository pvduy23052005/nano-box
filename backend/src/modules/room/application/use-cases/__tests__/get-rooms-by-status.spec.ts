import { GetRoomsByStatusUseCase } from '../get-rooms-by-status';
import { RoomRepositoryAdapter } from '../../ports/room.ports';
import { RoomProps } from '../../../domain/room.type';
import { RoomType, MemberStatus } from '../../../domain/chat.enum';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

const makeMockRoomRepository = (): jest.Mocked<RoomRepositoryAdapter> => ({
  save: jest.fn(),
  findRoomsByUserIdAndStatus: jest.fn(),
  checkRoomExist: jest.fn(),
  findById: jest.fn(),
  updateLastMessageId: jest.fn(),
  updateMemberLastReadMessage: jest.fn(),
});

describe('GetRoomsByStatusUseCase', () => {
  let useCase: GetRoomsByStatusUseCase;
  let roomRepository: jest.Mocked<RoomRepositoryAdapter>;

  const userId = 'user-123';
  const mockRooms: RoomProps[] = [
    {
      id: 'room-1',
      title: 'Nguyen Van A',
      typeRoom: RoomType.SINGLE,
      lastMessageId: null,
      avatar: 'http://example.com/avatar.png',
      members: [],
    },
  ];

  beforeEach(() => {
    roomRepository = makeMockRoomRepository();
    useCase = new GetRoomsByStatusUseCase(roomRepository);
  });

  it('nên trả về danh sách phòng theo status', async () => {
    roomRepository.findRoomsByUserIdAndStatus.mockResolvedValue(mockRooms);

    const result = await useCase.execute(userId, MemberStatus.ACCEPTED);

    expect(roomRepository.findRoomsByUserIdAndStatus).toHaveBeenCalledWith(
      userId,
      MemberStatus.ACCEPTED,
      undefined,
    );
    expect(result).toEqual(mockRooms);
  });

  it('nên truyền tham số search xuống repository khi có tìm kiếm', async () => {
    roomRepository.findRoomsByUserIdAndStatus.mockResolvedValue(mockRooms);

    const result = await useCase.execute(
      userId,
      MemberStatus.ACCEPTED,
      'Nguyen',
    );

    expect(roomRepository.findRoomsByUserIdAndStatus).toHaveBeenCalledWith(
      userId,
      MemberStatus.ACCEPTED,
      'Nguyen',
    );
    expect(result).toEqual(mockRooms);
  });

  it('nên ném DomainValidationException nếu status không hợp lệ', async () => {
    await expect(
      useCase.execute(userId, 'INVALID_STATUS' as MemberStatus),
    ).rejects.toThrow(DomainValidationException);

    expect(roomRepository.findRoomsByUserIdAndStatus).not.toHaveBeenCalled();
  });

  it('nên ném DomainValidationException nếu search dài hơn 100 ký tự', async () => {
    const longSearch = 'a'.repeat(101);
    await expect(
      useCase.execute(userId, MemberStatus.ACCEPTED, longSearch),
    ).rejects.toThrow(DomainValidationException);

    expect(roomRepository.findRoomsByUserIdAndStatus).not.toHaveBeenCalled();
  });
});
