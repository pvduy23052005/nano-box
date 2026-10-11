import { AddMemberToRoomUseCase } from '../add-member-to-room.use-case';
import { RoomRepositoryAdapter } from '../../ports/room.ports';
import { FriendshipRepositoryAdapter } from 'src/modules/friendship/applications/ports/friendship.port';
import { RoomProps } from '../../../domain/room.type';
import { RoomType, MemberRole, MemberStatus } from '../../../domain/chat.enum';
import { RoomEntity } from '../../../domain/room.entity';
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

describe('AddMemberToRoomUseCase', () => {
  let useCase: AddMemberToRoomUseCase;
  let roomRepository: jest.Mocked<RoomRepositoryAdapter>;
  let friendshipRepository: jest.Mocked<FriendshipRepositoryAdapter>;

  const superAdminId = '654321654321654321654321';
  const adminId = '123456123456123456123456';
  const regularMemberId = '111111111111111111111111';
  const targetFriendId = '222222222222222222222222';
  const validRoomId = '65f1234567890abcdef12345';

  const mockGroupRoom: RoomProps = {
    id: validRoomId,
    title: 'Nhóm Thảo Luận',
    typeRoom: RoomType.GROUP,
    lastMessageId: null,
    avatar: 'http://example.com/group.png',
    members: [
      {
        userId: superAdminId,
        role: MemberRole.SUPER_ADMIN,
        status: MemberStatus.ACCEPTED,
      },
      {
        userId: adminId,
        role: MemberRole.ADMIN,
        status: MemberStatus.ACCEPTED,
      },
      {
        userId: regularMemberId,
        role: MemberRole.MEMBER,
        status: MemberStatus.ACCEPTED,
      },
    ],
  };

  beforeEach(() => {
    roomRepository = makeMockRoomRepository();
    friendshipRepository = makeMockFriendshipRepository();
    useCase = new AddMemberToRoomUseCase(roomRepository, friendshipRepository);
  });

  it('nên thêm thành viên thành công khi người gọi là SUPER_ADMIN và hai người là bạn bè', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);
    friendshipRepository.checkAllAreFriends.mockResolvedValue(true);
    roomRepository.save.mockImplementation((roomEntity) =>
      Promise.resolve(roomEntity.toObject()),
    );

    const result = await useCase.execute(superAdminId, {
      roomId: validRoomId,
      userId: targetFriendId,
    });

    expect(roomRepository.findById).toHaveBeenCalledWith(
      validRoomId,
      superAdminId,
    );
    expect(friendshipRepository.checkAllAreFriends).toHaveBeenCalledWith(
      superAdminId,
      [targetFriendId],
    );
    expect(roomRepository.save).toHaveBeenCalledWith(expect.any(RoomEntity));

    const savedEntity = roomRepository.save.mock.calls[0][0];
    const newMember = savedEntity.getMember(targetFriendId);
    expect(newMember).toBeDefined();
    expect(newMember?.getRole()).toBe(MemberRole.MEMBER);
    expect(newMember?.getStatus()).toBe(MemberStatus.ACCEPTED);

    expect(result.members.some((m) => m.userId === targetFriendId)).toBe(true);
  });

  it('nên thêm thành viên thành công khi người gọi là ADMIN và hai người là bạn bè', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);
    friendshipRepository.checkAllAreFriends.mockResolvedValue(true);
    roomRepository.save.mockImplementation((roomEntity) =>
      Promise.resolve(roomEntity.toObject()),
    );

    const result = await useCase.execute(adminId, {
      roomId: validRoomId,
      userId: targetFriendId,
    });

    expect(friendshipRepository.checkAllAreFriends).toHaveBeenCalledWith(
      adminId,
      [targetFriendId],
    );
    expect(result.members.some((m) => m.userId === targetFriendId)).toBe(true);
  });

  it('nên kích hoạt lại thành viên cũ đang ở trạng thái WAITTING hoặc REFUSED', async () => {
    const roomWithWaitingMember: RoomProps = {
      ...mockGroupRoom,
      members: [
        ...mockGroupRoom.members,
        {
          userId: targetFriendId,
          role: MemberRole.MEMBER,
          status: MemberStatus.WAITTING,
        },
      ],
    };

    roomRepository.findById.mockResolvedValue(roomWithWaitingMember);
    friendshipRepository.checkAllAreFriends.mockResolvedValue(true);
    roomRepository.save.mockImplementation((roomEntity) =>
      Promise.resolve(roomEntity.toObject()),
    );

    const result = await useCase.execute(superAdminId, {
      roomId: validRoomId,
      userId: targetFriendId,
    });

    const targetMember = result.members.find(
      (m) => m.userId === targetFriendId,
    );
    expect(targetMember).toBeDefined();
    expect(targetMember?.status).toBe(MemberStatus.ACCEPTED);
  });

  it('nên ném DomainValidationException nếu không tìm thấy phòng', async () => {
    roomRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(superAdminId, {
        roomId: validRoomId,
        userId: targetFriendId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu người gọi tự thêm chính mình', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(superAdminId, {
        roomId: validRoomId,
        userId: superAdminId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu phòng là phòng chat 1-1 (SINGLE)', async () => {
    const singleRoom: RoomProps = {
      ...mockGroupRoom,
      typeRoom: RoomType.SINGLE,
    };
    roomRepository.findById.mockResolvedValue(singleRoom);

    await expect(
      useCase.execute(superAdminId, {
        roomId: validRoomId,
        userId: targetFriendId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu người gọi không phải là thành viên của phòng', async () => {
    const strangerId = '999999999999999999999999';
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(strangerId, {
        roomId: validRoomId,
        userId: targetFriendId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu người gọi là MEMBER thường (không phải admin)', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(regularMemberId, {
        roomId: validRoomId,
        userId: targetFriendId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu người được thêm không phải là bạn bè', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);
    friendshipRepository.checkAllAreFriends.mockResolvedValue(false);

    await expect(
      useCase.execute(superAdminId, {
        roomId: validRoomId,
        userId: targetFriendId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu người dùng đã là thành viên trong nhóm', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);
    friendshipRepository.checkAllAreFriends.mockResolvedValue(true);

    await expect(
      useCase.execute(superAdminId, {
        roomId: validRoomId,
        userId: regularMemberId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException khi RoomEntity.addMember nhận userId rỗng', () => {
    const roomEntity = RoomEntity.restore(mockGroupRoom);

    try {
      roomEntity.addMember(superAdminId, '   ');
      fail('Cần ném DomainValidationException');
    } catch (err) {
      expect(err).toBeInstanceOf(DomainValidationException);
      const domainErr = err as DomainValidationException;
      expect(domainErr.errors.userId).toBe('ID người dùng không được để trống');
    }
  });

  it('nên ném DomainValidationException khi RoomEntity.addMember được gọi trên phòng SINGLE', () => {
    const singleRoom: RoomProps = {
      ...mockGroupRoom,
      typeRoom: RoomType.SINGLE,
    };
    const roomEntity = RoomEntity.restore(singleRoom);

    try {
      roomEntity.addMember(superAdminId, targetFriendId);
      fail('Cần ném DomainValidationException');
    } catch (err) {
      expect(err).toBeInstanceOf(DomainValidationException);
      const domainErr = err as DomainValidationException;
      expect(domainErr.errors.typeRoom).toBe(
        'Chỉ có thể thêm thành viên vào phòng nhóm',
      );
    }
  });

  it('nên ném DomainValidationException trực tiếp từ RoomEntity nếu người gọi không phải thành viên', () => {
    const roomEntity = RoomEntity.restore(mockGroupRoom);

    try {
      roomEntity.addMember('stranger-id', targetFriendId);
      fail('Cần ném DomainValidationException');
    } catch (err) {
      expect(err).toBeInstanceOf(DomainValidationException);
      const domainErr = err as DomainValidationException;
      expect(domainErr.errors.member).toBe(
        'Bạn không phải là thành viên của phòng này',
      );
    }
  });

  it('nên ném DomainValidationException trực tiếp từ RoomEntity nếu người gọi là MEMBER thường', () => {
    const roomEntity = RoomEntity.restore(mockGroupRoom);

    try {
      roomEntity.addMember(regularMemberId, targetFriendId);
      fail('Cần ném DomainValidationException');
    } catch (err) {
      expect(err).toBeInstanceOf(DomainValidationException);
      const domainErr = err as DomainValidationException;
      expect(domainErr.errors.role).toBe(
        'Chỉ quản trị viên mới có quyền thêm thành viên vào nhóm',
      );
    }
  });
});
