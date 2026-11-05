import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

import { MemberRole, MemberStatus, RoomType } from '../../../domain/chat.enum';
import { RoomMember } from '../../../domain/member.object';
import { RoomEntity } from '../../../domain/room.entity';
import { RoomProps } from '../../../domain/room.type';
import { RoomRepositoryAdapter } from '../../ports/room.ports';
import { AssignRoomAdminUseCase } from '../assign-room-admin.use-case';

const makeMockRoomRepository = (): jest.Mocked<RoomRepositoryAdapter> => ({
  save: jest.fn(),
  findRoomsByUserIdAndStatus: jest.fn(),
  checkRoomExist: jest.fn(),
  findById: jest.fn(),
  updateLastMessageId: jest.fn(),
  updateMemberLastReadMessage: jest.fn(),
  acceptAllMembers: jest.fn(),
});

describe('AssignRoomAdminUseCase', () => {
  let useCase: AssignRoomAdminUseCase;
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
    useCase = new AssignRoomAdminUseCase(roomRepository);
  });

  it('nên phong quản trị viên (ADMIN) thành công khi người gọi là SUPER_ADMIN', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);
    roomRepository.save.mockImplementation((roomEntity) =>
      Promise.resolve(roomEntity.toObject()),
    );

    const result = await useCase.execute(superAdminId, {
      roomId: validRoomId,
      userId: regularMemberId,
    });

    expect(roomRepository.findById).toHaveBeenCalledWith(
      validRoomId,
      superAdminId,
    );
    expect(roomRepository.save).toHaveBeenCalledWith(expect.any(RoomEntity));

    const updatedTarget = result.members.find(
      (m) => m.userId === regularMemberId,
    );
    expect(updatedTarget?.role).toBe(MemberRole.ADMIN);
  });

  it('nên ném DomainValidationException nếu ADMIN cố gắng phong quản trị viên cho người khác (chỉ SUPER_ADMIN có quyền)', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(adminId, {
        roomId: validRoomId,
        userId: regularMemberId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu MEMBER thường cố gắng phong quản trị viên', async () => {
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

  it('nên ném DomainValidationException nếu người được phong quyền không tồn tại trong phòng', async () => {
    const strangerId = '999999999999999999999999';
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(superAdminId, {
        roomId: validRoomId,
        userId: strangerId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu người được phong quyền đã là ADMIN hoặc SUPER_ADMIN', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(superAdminId, {
        roomId: validRoomId,
        userId: adminId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException khi RoomEntity.assignAdmin nhận userId rỗng', () => {
    const roomEntity = RoomEntity.restore(mockGroupRoom);

    try {
      roomEntity.assignAdmin(superAdminId, '   ');
      fail('Cần ném DomainValidationException');
    } catch (err) {
      expect(err).toBeInstanceOf(DomainValidationException);
      const domainErr = err as DomainValidationException;
      expect(domainErr.errors.userId).toBe(
        'ID thành viên cần bổ nhiệm không được để trống',
      );
    }
  });

  describe('RoomMember.canBeAssignedAdminBy', () => {
    it('cho phép SUPER_ADMIN phong ADMIN cho MEMBER thường', () => {
      const superAdmin = RoomMember.createSuperAdmin(superAdminId);
      const member = RoomMember.createMember(regularMemberId);

      const result = member.canBeAssignedAdminBy(superAdmin);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('không cho phép ADMIN phong ADMIN cho MEMBER khác', () => {
      const admin = RoomMember.createAdmin(adminId);
      const member = RoomMember.createMember(regularMemberId);

      const result = member.canBeAssignedAdminBy(admin);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe(
        'Chỉ trưởng nhóm mới có quyền bổ nhiệm quản trị viên',
      );
    });

    it('không cho phép bổ nhiệm khi thành viên đã là ADMIN', () => {
      const superAdmin = RoomMember.createSuperAdmin(superAdminId);
      const admin = RoomMember.createAdmin(adminId);

      const result = admin.canBeAssignedAdminBy(superAdmin);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe(
        'Thành viên này đã là quản trị viên hoặc trưởng nhóm',
      );
    });
  });
});
