import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

import { MemberRole, MemberStatus, RoomType } from '../../../domain/chat.enum';
import { RoomEntity } from '../../../domain/room.entity';
import { RoomProps } from '../../../domain/room.type';
import { RoomRepositoryAdapter } from '../../ports/room.ports';
import { LeaveRoomUseCase } from '../leave-room.use-case';

const makeMockRoomRepository = (): jest.Mocked<RoomRepositoryAdapter> => ({
  save: jest.fn(),
  findRoomsByUserIdAndStatus: jest.fn(),
  checkRoomExist: jest.fn(),
  findById: jest.fn(),
  updateLastMessageId: jest.fn(),
  updateMemberLastReadMessage: jest.fn(),
  acceptAllMembers: jest.fn(),
  deleteRoom: jest.fn(),
});

describe('LeaveRoomUseCase', () => {
  let useCase: LeaveRoomUseCase;
  let roomRepository: jest.Mocked<RoomRepositoryAdapter>;

  const superAdminId = '654321654321654321654321';
  const adminId = '123456123456123456123456';
  const regularMemberId = '111111111111111111111111';
  const regularMemberId2 = '333333333333333333333333';
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
    useCase = new LeaveRoomUseCase(roomRepository);
  });

  it('nên cho phép thành viên thường (MEMBER) rời phòng thành công', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);
    roomRepository.save.mockImplementation((roomEntity) =>
      Promise.resolve(roomEntity.toObject()),
    );

    const result = await useCase.execute(regularMemberId, {
      roomId: validRoomId,
    });

    expect(result.success).toBe(true);
    expect(result.isRoomEmpty).toBe(false);
    expect(result.newSuperAdminId).toBeUndefined();
    expect(roomRepository.save).toHaveBeenCalledTimes(1);

    const savedMembers = result.room?.members || [];
    expect(savedMembers.some((m) => m.userId === regularMemberId)).toBe(false);
    expect(savedMembers.length).toBe(2);
  });

  it('nên cho phép quản trị viên (ADMIN) rời phòng thành công', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);
    roomRepository.save.mockImplementation((roomEntity) =>
      Promise.resolve(roomEntity.toObject()),
    );

    const result = await useCase.execute(adminId, {
      roomId: validRoomId,
    });

    expect(result.success).toBe(true);
    expect(result.isRoomEmpty).toBe(false);
    expect(result.newSuperAdminId).toBeUndefined();
    expect(roomRepository.save).toHaveBeenCalledTimes(1);

    const savedMembers = result.room?.members || [];
    expect(savedMembers.some((m) => m.userId === adminId)).toBe(false);
  });

  it('nên tự động thăng cấp ADMIN thành SUPER_ADMIN khi SUPER_ADMIN rời phòng', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);
    roomRepository.save.mockImplementation((roomEntity) =>
      Promise.resolve(roomEntity.toObject()),
    );

    const result = await useCase.execute(superAdminId, {
      roomId: validRoomId,
    });

    expect(result.success).toBe(true);
    expect(result.isRoomEmpty).toBe(false);
    expect(result.newSuperAdminId).toBe(adminId);

    const newSuperAdmin = result.room?.members?.find(
      (m) => m.userId === adminId,
    );
    expect(newSuperAdmin?.role).toBe(MemberRole.SUPER_ADMIN);
  });

  it('nên tự động thăng cấp MEMBER thành SUPER_ADMIN nếu phòng không có ADMIN nào khi SUPER_ADMIN rời', async () => {
    const groupWithoutAdmin: RoomProps = {
      ...mockGroupRoom,
      members: [
        {
          userId: superAdminId,
          role: MemberRole.SUPER_ADMIN,
          status: MemberStatus.ACCEPTED,
        },
        {
          userId: regularMemberId,
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
        {
          userId: regularMemberId2,
          role: MemberRole.MEMBER,
          status: MemberStatus.ACCEPTED,
        },
      ],
    };

    roomRepository.findById.mockResolvedValue(groupWithoutAdmin);
    roomRepository.save.mockImplementation((roomEntity) =>
      Promise.resolve(roomEntity.toObject()),
    );

    const result = await useCase.execute(superAdminId, {
      roomId: validRoomId,
    });

    expect(result.success).toBe(true);
    expect(result.isRoomEmpty).toBe(false);
    expect(result.newSuperAdminId).toBe(regularMemberId);

    const newSuperAdmin = result.room?.members?.find(
      (m) => m.userId === regularMemberId,
    );
    expect(newSuperAdmin?.role).toBe(MemberRole.SUPER_ADMIN);
  });

  it('nên xóa phòng (deleteRoom) khi thành viên cuối cùng rời phòng', async () => {
    const singleMemberGroup: RoomProps = {
      ...mockGroupRoom,
      members: [
        {
          userId: superAdminId,
          role: MemberRole.SUPER_ADMIN,
          status: MemberStatus.ACCEPTED,
        },
      ],
    };

    roomRepository.findById.mockResolvedValue(singleMemberGroup);
    roomRepository.deleteRoom.mockResolvedValue(true);

    const result = await useCase.execute(superAdminId, {
      roomId: validRoomId,
    });

    expect(result.success).toBe(true);
    expect(result.isRoomEmpty).toBe(true);
    expect(roomRepository.deleteRoom).toHaveBeenCalledWith(validRoomId);
    expect(roomRepository.save).not.toHaveBeenCalled();
  });

  it('nên ném DomainValidationException nếu không tìm thấy phòng', async () => {
    roomRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(regularMemberId, { roomId: validRoomId }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu người dùng không phải là thành viên trong phòng', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute('unknown-user-id', { roomId: validRoomId }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu cố gắng rời phòng dạng SINGLE', async () => {
    const singleRoom: RoomProps = {
      ...mockGroupRoom,
      typeRoom: RoomType.SINGLE,
    };

    roomRepository.findById.mockResolvedValue(singleRoom);

    await expect(
      useCase.execute(superAdminId, { roomId: validRoomId }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu roomId rỗng', async () => {
    await expect(
      useCase.execute(superAdminId, { roomId: '   ' }),
    ).rejects.toThrow(DomainValidationException);
  });
});
