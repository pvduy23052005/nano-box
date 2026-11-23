import { CreateGroupRoomUseCase } from '../create-group-room';
import { RoomRepositoryAdapter } from '../../ports/room.ports';
import { FriendshipRepositoryAdapter } from 'src/modules/friendship/applications/ports/friendship.port';
import { RoomEntity } from '../../../domain/room.entity';
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

const makeMockFriendshipRepository =
  (): jest.Mocked<FriendshipRepositoryAdapter> => ({
    save: jest.fn(),
    findById: jest.fn(),
    findBetweenUsers: jest.fn(),
    findPendingReceived: jest.fn(),
    findFriends: jest.fn(),
    checkAllAreFriends: jest.fn(),
  });

describe('CreateGroupRoomUseCase', () => {
  let useCase: CreateGroupRoomUseCase;
  let roomRepository: jest.Mocked<RoomRepositoryAdapter>;
  let friendshipRepository: jest.Mocked<FriendshipRepositoryAdapter>;

  const myId = '654321654321654321654321';
  const userB = '111111111111111111111111';
  const userC = '222222222222222222222222';

  beforeEach(() => {
    roomRepository = makeMockRoomRepository();
    friendshipRepository = makeMockFriendshipRepository();

    roomRepository.save.mockImplementation((room: RoomEntity) =>
      Promise.resolve(room.toObject()),
    );
    // Mặc định các thành viên là bạn bè
    friendshipRepository.checkAllAreFriends.mockResolvedValue(true);

    useCase = new CreateGroupRoomUseCase(roomRepository, friendshipRepository);
  });

  it('nên tạo phòng nhóm thành công khi người tạo và các thành viên là bạn bè', async () => {
    const result = await useCase.execute(myId, {
      title: '  Nhóm Học Tập  ',
      memberIds: [userB, userC],
    });

    expect(friendshipRepository.checkAllAreFriends).toHaveBeenCalledWith(myId, [
      userB,
      userC,
    ]);
    expect(roomRepository.save).toHaveBeenCalledTimes(1);
    expect(result.typeRoom).toBe(RoomType.GROUP);
    expect(result.title).toBe('Nhóm Học Tập');
    expect(result.avatar).toBeNull();
    expect(result.members).toEqual([
      {
        userId: myId,
        role: MemberRole.SUPER_ADMIN,
        status: MemberStatus.ACCEPTED,
      },
      { userId: userB, role: MemberRole.MEMBER, status: MemberStatus.ACCEPTED },
      { userId: userC, role: MemberRole.MEMBER, status: MemberStatus.ACCEPTED },
    ]);
  });

  it('nên ném DomainValidationException khi có thành viên không phải là bạn bè', async () => {
    friendshipRepository.checkAllAreFriends.mockResolvedValue(false);

    let error: DomainValidationException | undefined;
    try {
      await useCase.execute(myId, {
        title: 'Nhóm Học Tập',
        memberIds: [userB, userC],
      });
    } catch (e) {
      error = e as DomainValidationException;
    }

    expect(error).toBeInstanceOf(DomainValidationException);
    expect(error?.errors.memberIds).toBe(
      'Chỉ có thể thêm những người là bạn bè vào nhóm',
    );
    expect(roomRepository.save).not.toHaveBeenCalled();
  });

  it('nên tự động loại bỏ ID trùng lặp và ID của người tạo trước khi kiểm tra bạn bè', async () => {
    const result = await useCase.execute(myId, {
      title: 'Nhóm',
      memberIds: [userB, myId, userB, userC, userC, ''],
    });

    expect(friendshipRepository.checkAllAreFriends).toHaveBeenCalledWith(myId, [
      userB,
      userC,
    ]);
    expect(result.members.map((m) => m.userId)).toEqual([myId, userB, userC]);
  });

  it('nên ném DomainValidationException khi tên nhóm rỗng', async () => {
    await expect(
      useCase.execute(myId, { title: '   ', memberIds: [userB, userC] }),
    ).rejects.toThrow(DomainValidationException);
    expect(roomRepository.save).not.toHaveBeenCalled();
  });

  it('nên ném DomainValidationException khi số thành viên hợp lệ < 2', async () => {
    await expect(
      useCase.execute(myId, { title: 'Nhóm', memberIds: [userB, userB, myId] }),
    ).rejects.toThrow(DomainValidationException);
    expect(roomRepository.save).not.toHaveBeenCalled();
  });
});
