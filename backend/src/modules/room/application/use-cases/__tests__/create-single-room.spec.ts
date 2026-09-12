import { CreateSingleRoomUseCase } from '../create-single-room';
import { RoomRepositoryAdapter } from '../../ports/room.ports';
import { RoomProps } from '../../../domain/room.type';
import { RoomType, MemberRole, MemberStatus } from '../../../domain/chat.enum';

const makeMockRoomRepository = (): jest.Mocked<RoomRepositoryAdapter> => ({
  save: jest.fn(),
  findRoomsByUserIdAndStatus: jest.fn(),
  checkRoomExist: jest.fn(),
  findById: jest.fn(),
});

describe('CreateSingleRoomUseCase', () => {
  let useCase: CreateSingleRoomUseCase;
  let roomRepository: jest.Mocked<RoomRepositoryAdapter>;

  const myId = '654321654321654321654321';
  const userId = '123456123456123456123456';

  const mockExistingRoom: RoomProps = {
    id: 'room-123',
    title: 'Test Room',
    typeRoom: RoomType.SINGLE,
    lastMessageId: null,
    avatar: 'http://example.com/avatar.png',
    members: [
      { userId: myId, role: MemberRole.MEMBER, status: MemberStatus.ACCEPTED },
      {
        userId: userId,
        role: MemberRole.MEMBER,
        status: MemberStatus.ACCEPTED,
      },
    ],
  };

  beforeEach(() => {
    roomRepository = makeMockRoomRepository();
    useCase = new CreateSingleRoomUseCase(roomRepository);
  });

  it('nên trả về phòng đã tồn tại nếu tìm thấy và không gọi save', async () => {
    roomRepository.checkRoomExist.mockResolvedValue(mockExistingRoom);

    const result = await useCase.execute(myId, userId);

    expect(roomRepository.checkRoomExist).toHaveBeenCalledTimes(1);
    expect(roomRepository.checkRoomExist).toHaveBeenCalledWith(myId, userId);
    expect(roomRepository.save).not.toHaveBeenCalled();
    expect(result).toEqual(mockExistingRoom);
  });

  it('nên tạo phòng mới và gọi save nếu phòng chưa tồn tại', async () => {
    roomRepository.checkRoomExist.mockResolvedValue(null);
    const mockCreatedRoom: RoomProps = {
      id: 'room-new',
      title: null,
      typeRoom: RoomType.SINGLE,
      lastMessageId: null,
      avatar: null,
      members: [
        {
          userId: myId,
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
        {
          userId: userId,
          role: MemberRole.MEMBER,
          status: MemberStatus.WAITTING,
        },
      ],
    };
    roomRepository.save.mockResolvedValue(mockCreatedRoom);

    const result = await useCase.execute(myId, userId);

    expect(roomRepository.checkRoomExist).toHaveBeenCalledTimes(1);
    expect(roomRepository.checkRoomExist).toHaveBeenCalledWith(myId, userId);
    expect(roomRepository.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCreatedRoom);
  });
});
