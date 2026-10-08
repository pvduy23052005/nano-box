import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

import { MemberRole, MemberStatus, RoomType } from '../../../domain/chat.enum';
import { RoomMember } from '../../../domain/member.object';
import { RoomEntity } from '../../../domain/room.entity';
import { RoomProps } from '../../../domain/room.type';
import { RoomRepositoryAdapter } from '../../ports/room.ports';
import { RevokeRoomAdminUseCase } from '../revoke-room-admin.use-case';

const makeMockRoomRepository = (): jest.Mocked<RoomRepositoryAdapter> => ({
  save: jest.fn(),
  findRoomsByUserIdAndStatus: jest.fn(),
  checkRoomExist: jest.fn(),
  findById: jest.fn(),
  updateLastMessageId: jest.fn(),
  updateMemberLastReadMessage: jest.fn(),
  acceptAllMembers: jest.fn(),
});

describe('RevokeRoomAdminUseCase', () => {
  let useCase: RevokeRoomAdminUseCase;
  let roomRepository: jest.Mocked<RoomRepositoryAdapter>;

  const superAdminId = '654321654321654321654321';
  const adminId = '123456123456123456123456';
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
    useCase = new RevokeRoomAdminUseCase(roomRepository);
  });

  it('nên cắt chức quản trị viên (ADMIN -> MEMBER) thành công khi người gọi là SUPER_ADMIN', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);
    roomRepository.save.mockImplementation((roomEntity) =>
      Promise.resolve(roomEntity.toObject()),
    );

    const result = await useCase.execute(superAdminId, {
      roomId: validRoomId,
      userId: adminId,
    });

    expect(roomRepository.findById).toHaveBeenCalledWith(
      validRoomId,
      superAdminId,
    );
    expect(roomRepository.save).toHaveBeenCalledWith(expect.any(RoomEntity));

    const updatedTarget = result.members.find((m) => m.userId === adminId);
    expect(updatedTarget?.role).toBe(MemberRole.MEMBER);
  });

  it('nên ném DomainValidationException nếu ADMIN cố gắng cắt chức quản trị viên của người khác (chỉ SUPER_ADMIN có quyền)', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(adminId, {
        roomId: validRoomId,
        userId: adminId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu MEMBER thường cố gắng cắt chức quản trị viên', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(regularMemberId, {
        roomId: validRoomId,
        userId: adminId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu không tìm thấy phòng', async () => {
    roomRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(superAdminId, {
        roomId: validRoomId,
        userId: adminId,
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
        userId: adminId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu người bị cắt chức không tồn tại trong phòng', async () => {
    const strangerId = '999999999999999999999999';
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(superAdminId, {
        roomId: validRoomId,
        userId: strangerId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu người bị cắt chức đang không phải là ADMIN (ví dụ MEMBER thường)', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(superAdminId, {
        roomId: validRoomId,
        userId: regularMemberId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu người bị cắt chức là SUPER_ADMIN', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(superAdminId, {
        roomId: validRoomId,
        userId: superAdminId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException khi RoomEntity.revokeAdmin nhận userId rỗng', () => {
    const roomEntity = RoomEntity.restore(mockGroupRoom);

    try {
      (roomEntity as any).revokeAdmin(superAdminId, '   ');
      fail('Cần ném DomainValidationException');
    } catch (err) {
      expect(err).toBeInstanceOf(DomainValidationException);
      const domainErr = err as DomainValidationException;
      expect(domainErr.errors.userId).toBe(
        'ID thành viên cần cắt chức không được để trống',
      );
    }
  });

  describe('RoomMember.canBeRevokedAdminBy', () => {
    it('cho phép SUPER_ADMIN cắt chức ADMIN về MEMBER', () => {
      const superAdmin = RoomMember.createSuperAdmin(superAdminId);
      const admin = RoomMember.createAdmin(adminId);

      const result = (admin as any).canBeRevokedAdminBy(superAdmin);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('không cho phép ADMIN cắt chức ADMIN khác', () => {
      const adminActor = RoomMember.createAdmin(superAdminId);
      const adminTarget = RoomMember.createAdmin(adminId);

      const result = (adminTarget as any).canBeRevokedAdminBy(adminActor);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe(
        'Chỉ trưởng nhóm mới có quyền cắt chức quản trị viên',
      );
    });

    it('không cho phép cắt chức khi thành viên không phải là ADMIN (đang là MEMBER)', () => {
      const superAdmin = RoomMember.createSuperAdmin(superAdminId);
      const member = RoomMember.createMember(regularMemberId);

      const result = (member as any).canBeRevokedAdminBy(superAdmin);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe(
        'Thành viên này không phải là quản trị viên',
      );
    });

    it('không cho phép cắt chức khi thành viên là SUPER_ADMIN', () => {
      const superAdminActor = RoomMember.createSuperAdmin(superAdminId);
      const superAdminTarget = RoomMember.createSuperAdmin(adminId);

      const result = (superAdminTarget as any).canBeRevokedAdminBy(superAdminActor);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe(
        'Không thể cắt chức Trưởng nhóm',
      );
    });
  });
});
