import { EnsureFriendRoomUseCase } from '../ensure-friend-room.use-case';
import { RoomRepositoryAdapter } from '../../ports/room.ports';
import { RoomProps } from '../../../domain/room.type';
import { RoomType, MemberRole, MemberStatus } from '../../../domain/chat.enum';

const makeMockRoomRepository = (): jest.Mocked<RoomRepositoryAdapter> => ({
  save: jest.fn(),
  findRoomsByUserIdAndStatus: jest.fn(),
  checkRoomExist: jest.fn(),
  findById: jest.fn(),
  updateLastMessageId: jest.fn(),
  updateMemberLastReadMessage: jest.fn(),
  acceptAllMembers: jest.fn(),
});

describe('EnsureFriendRoomUseCase', () => {
  let useCase: EnsureFriendRoomUseCase;
  let roomRepository: jest.Mocked<RoomRepositoryAdapter>;

  const user1Id = '654321654321654321654321';
  const user2Id = '123456123456123456123456';

  beforeEach(() => {
    roomRepository = makeMockRoomRepository();
    useCase = new EnsureFriendRoomUseCase(roomRepository);
  });

  it('nên cập nhật cả 2 member thành ACCEPTED nếu phòng đã tồn tại và có member chưa ACCEPTED', async () => {
    const existingRoom: RoomProps = {
      id: 'room-123',
      title: 'Test Room',
      typeRoom: RoomType.SINGLE,
      lastMessageId: null,
      avatar: null,
      members: [
        {
          userId: user1Id,
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
        {
          userId: user2Id,
          role: MemberRole.MEMBER,
          status: MemberStatus.WAITTING,
        },
      ],
    };

    const updatedRoom: RoomProps = {
      ...existingRoom,
      members: [
        {
          userId: user1Id,
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
        {
          userId: user2Id,
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
      ],
    };

    roomRepository.checkRoomExist.mockResolvedValue(existingRoom);
    roomRepository.acceptAllMembers.mockResolvedValue(updatedRoom);

    const result = await useCase.execute(user1Id, user2Id);

    expect(roomRepository.checkRoomExist).toHaveBeenCalledWith(
      user1Id,
      user2Id,
    );
    expect(roomRepository.acceptAllMembers).toHaveBeenCalledWith('room-123');
    expect(roomRepository.save).not.toHaveBeenCalled();
    expect(result).toEqual(updatedRoom);
  });

  it('nên giữ nguyên phòng nếu cả 2 member đã ACCEPTED từ trước', async () => {
    const existingRoom: RoomProps = {
      id: 'room-123',
      title: 'Test Room',
      typeRoom: RoomType.SINGLE,
      lastMessageId: null,
      avatar: null,
      members: [
        {
          userId: user1Id,
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
        {
          userId: user2Id,
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
      ],
    };

    roomRepository.checkRoomExist.mockResolvedValue(existingRoom);

    const result = await useCase.execute(user1Id, user2Id);

    expect(roomRepository.checkRoomExist).toHaveBeenCalledWith(
      user1Id,
      user2Id,
    );
    expect(roomRepository.acceptAllMembers).not.toHaveBeenCalled();
    expect(roomRepository.save).not.toHaveBeenCalled();
    expect(result).toEqual(existingRoom);
  });

  it('nên tạo phòng mới với cả 2 member ACCEPTED nếu chưa tồn tại phòng', async () => {
    roomRepository.checkRoomExist.mockResolvedValue(null);

    const createdRoom: RoomProps = {
      id: 'room-new',
      title: null,
      typeRoom: RoomType.SINGLE,
      lastMessageId: null,
      avatar: null,
      members: [
        {
          userId: user1Id,
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
        {
          userId: user2Id,
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
      ],
    };

    roomRepository.save.mockResolvedValue(createdRoom);

    const result = await useCase.execute(user1Id, user2Id);

    expect(roomRepository.checkRoomExist).toHaveBeenCalledWith(
      user1Id,
      user2Id,
    );
    expect(roomRepository.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual(createdRoom);
  });
});
