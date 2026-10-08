import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

import { MemberRole, MemberStatus, RoomType } from '../../../domain/chat.enum';
import { RoomMember } from '../../../domain/member.object';
import { RoomEntity } from '../../../domain/room.entity';
import { RoomProps } from '../../../domain/room.type';
import { RoomRepositoryAdapter } from '../../ports/room.ports';
import { RemoveMemberFromRoomUseCase } from '../remove-member-from-room.use-case';

const makeMockRoomRepository = (): jest.Mocked<RoomRepositoryAdapter> => ({
  save: jest.fn(),
  findRoomsByUserIdAndStatus: jest.fn(),
  checkRoomExist: jest.fn(),
  findById: jest.fn(),
  updateLastMessageId: jest.fn(),
  updateMemberLastReadMessage: jest.fn(),
  acceptAllMembers: jest.fn(),
});

describe('RemoveMemberFromRoomUseCase', () => {
  let useCase: RemoveMemberFromRoomUseCase;
  let roomRepository: jest.Mocked<RoomRepositoryAdapter>;

  const superAdminId = '654321654321654321654321';
  const adminId1 = '123456123456123456123456';
  const adminId2 = '222222222222222222222222';
  const regularMemberId = '111111111111111111111111';
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
        userId: adminId1,
        role: MemberRole.ADMIN,
        status: MemberStatus.ACCEPTED,
      },
      {
        userId: adminId2,
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
    useCase = new RemoveMemberFromRoomUseCase(roomRepository);
  });

  it('nên xóa thành viên thành công khi người gọi là SUPER_ADMIN xóa một ADMIN', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);
    roomRepository.save.mockImplementation((roomEntity) =>
      Promise.resolve(roomEntity.toObject()),
    );

    const result = await useCase.execute(superAdminId, {
      roomId: validRoomId,
      userId: adminId1,
    });

    expect(roomRepository.findById).toHaveBeenCalledWith(
      validRoomId,
      superAdminId,
    );
    expect(roomRepository.save).toHaveBeenCalledWith(expect.any(RoomEntity));

    const savedEntity = roomRepository.save.mock.calls[0][0];
    expect(savedEntity.getMember(adminId1)).toBeUndefined();
    expect(result.members.some((m) => m.userId === adminId1)).toBe(false);
  });

  it('nên xóa thành viên thành công khi người gọi là SUPER_ADMIN xóa một MEMBER', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);
    roomRepository.save.mockImplementation((roomEntity) =>
      Promise.resolve(roomEntity.toObject()),
    );

    const result = await useCase.execute(superAdminId, {
      roomId: validRoomId,
      userId: regularMemberId,
    });

    expect(result.members.some((m) => m.userId === regularMemberId)).toBe(false);
  });

  it('nên xóa thành viên thành công khi người gọi là ADMIN xóa một MEMBER', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);
    roomRepository.save.mockImplementation((roomEntity) =>
      Promise.resolve(roomEntity.toObject()),
    );

    const result = await useCase.execute(adminId1, {
      roomId: validRoomId,
      userId: regularMemberId,
    });

    expect(result.members.some((m) => m.userId === regularMemberId)).toBe(false);
  });

  it('nên ném DomainValidationException nếu ADMIN cố gắng xóa SUPER_ADMIN', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(adminId1, {
        roomId: validRoomId,
        userId: superAdminId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu ADMIN cố gắng xóa một ADMIN khác', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(adminId1, {
        roomId: validRoomId,
        userId: adminId2,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu thành viên thường (MEMBER) cố gắng xóa người khác', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(regularMemberId, {
        roomId: validRoomId,
        userId: adminId1,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu người gọi không phải thành viên của phòng', async () => {
    const strangerId = '999999999999999999999999';
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(strangerId, {
        roomId: validRoomId,
        userId: regularMemberId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu người gọi tự xóa chính mình', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(superAdminId, {
        roomId: validRoomId,
        userId: superAdminId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu không tìm thấy phòng', async () => {
    roomRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(superAdminId, {
        roomId: validRoomId,
        userId: regularMemberId,
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
        userId: regularMemberId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu người cần xóa không có trong phòng', async () => {
    const strangerId = '999999999999999999999999';
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(superAdminId, {
        roomId: validRoomId,
        userId: strangerId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException khi RoomEntity.removeMember nhận userId rỗng', () => {
    const roomEntity = RoomEntity.restore(mockGroupRoom);

    try {
      roomEntity.removeMember(superAdminId, '   ');
      fail('Cần ném DomainValidationException');
    } catch (err) {
      expect(err).toBeInstanceOf(DomainValidationException);
      const domainErr = err as DomainValidationException;
      expect(domainErr.errors.userId).toBe(
        'ID thành viên cần xóa không được để trống',
      );
    }
  });

  it('nên ném DomainValidationException trực tiếp từ RoomEntity nếu ADMIN xóa ADMIN khác', () => {
    const roomEntity = RoomEntity.restore(mockGroupRoom);

    try {
      roomEntity.removeMember(adminId1, adminId2);
      fail('Cần ném DomainValidationException');
    } catch (err) {
      expect(err).toBeInstanceOf(DomainValidationException);
      const domainErr = err as DomainValidationException;
      expect(domainErr.errors.role).toBe(
        'Quản trị viên không thể xóa Quản trị viên khác',
      );
    }
  });

  it('nên ném DomainValidationException trực tiếp từ RoomEntity nếu bất kỳ ai cố xóa SUPER_ADMIN', () => {
    const roomEntity = RoomEntity.restore(mockGroupRoom);

    try {
      roomEntity.removeMember(adminId1, superAdminId);
      fail('Cần ném DomainValidationException');
    } catch (err) {
      expect(err).toBeInstanceOf(DomainValidationException);
      const domainErr = err as DomainValidationException;
      expect(domainErr.errors.role).toBe(
        'Không thể xóa Trưởng nhóm khỏi phòng',
      );
    }
  });

  describe('RoomMember.canBeRemovedBy', () => {
    it('không cho phép xóa SUPER_ADMIN bất kể người gọi là ai', () => {
      const superAdmin = RoomMember.createSuperAdmin(superAdminId);
      const anotherSuperAdmin = RoomMember.createSuperAdmin(adminId1);

      const result = superAdmin.canBeRemovedBy(anotherSuperAdmin);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe(
        'Không thể xóa Trưởng nhóm khỏi phòng',
      );
    });

    it('không cho phép ADMIN xóa ADMIN khác', () => {
      const admin1 = RoomMember.createAdmin(adminId1);
      const admin2 = RoomMember.createAdmin(adminId2);

      const result = admin2.canBeRemovedBy(admin1);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe(
        'Quản trị viên không thể xóa Quản trị viên khác',
      );
    });

    it('cho phép SUPER_ADMIN xóa ADMIN', () => {
      const superAdmin = RoomMember.createSuperAdmin(superAdminId);
      const admin = RoomMember.createAdmin(adminId1);

      const result = admin.canBeRemovedBy(superAdmin);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('cho phép ADMIN xóa MEMBER thường', () => {
      const admin = RoomMember.createAdmin(adminId1);
      const member = RoomMember.createMember(regularMemberId);

      const result = member.canBeRemovedBy(admin);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('cung cấp các Java-style getters đúng quy chuẩn Naming Conventions', () => {
      const member = RoomMember.restore(
        regularMemberId,
        MemberRole.MEMBER,
        MemberStatus.ACCEPTED,
        'msg-123',
      );
      expect(member.getUserId()).toBe(regularMemberId);
      expect(member.getRole()).toBe(MemberRole.MEMBER);
      expect(member.getStatus()).toBe(MemberStatus.ACCEPTED);
      expect(member.getLastReadMessageId()).toBe('msg-123');
    });
  });
});
