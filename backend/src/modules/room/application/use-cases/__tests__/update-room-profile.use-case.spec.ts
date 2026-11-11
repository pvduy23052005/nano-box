import { UpdateRoomProfileUseCase } from '../update-room-profile.use-case';
import { RoomRepositoryAdapter } from '../../ports/room.ports';
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

describe('UpdateRoomProfileUseCase', () => {
  let useCase: UpdateRoomProfileUseCase;
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
    avatar: 'http://example.com/old-avatar.png',
    members: [
      {
        userId: superAdminId,
        role: MemberRole.SUPER_ADMIN,
        status: MemberStatus.ACCEPTED,
        lastReadMessageId: null,
      },
      {
        userId: adminId,
        role: MemberRole.ADMIN,
        status: MemberStatus.ACCEPTED,
        lastReadMessageId: null,
      },
      {
        userId: regularMemberId,
        role: MemberRole.MEMBER,
        status: MemberStatus.ACCEPTED,
        lastReadMessageId: null,
      },
    ],
  };

  beforeEach(() => {
    roomRepository = makeMockRoomRepository();
    useCase = new UpdateRoomProfileUseCase(roomRepository);
  });

  it('nên cập nhật cả title và avatar thành công khi người gọi là SUPER_ADMIN', async () => {
    const updatedProps: RoomProps = {
      ...mockGroupRoom,
      title: 'Tên Nhóm Mới',
      avatar: 'http://example.com/new-avatar.png',
    };

    roomRepository.findById.mockResolvedValue(mockGroupRoom);
    roomRepository.save.mockResolvedValue(updatedProps);

    const result = await useCase.execute(superAdminId, {
      roomId: validRoomId,
      title: 'Tên Nhóm Mới',
      avatar: 'http://example.com/new-avatar.png',
    });

    expect(roomRepository.findById).toHaveBeenCalledWith(
      validRoomId,
      superAdminId,
    );
    expect(roomRepository.save).toHaveBeenCalledWith(expect.any(RoomEntity));
    const savedEntity = roomRepository.save.mock.calls[0][0];
    expect(savedEntity.getTitle()).toBe('Tên Nhóm Mới');
    expect(savedEntity.getAvatar()).toBe('http://example.com/new-avatar.png');
    expect(result.title).toBe('Tên Nhóm Mới');
    expect(result.avatar).toBe('http://example.com/new-avatar.png');
  });

  it('nên cập nhật chỉ title thành công khi người gọi là ADMIN', async () => {
    const updatedProps: RoomProps = {
      ...mockGroupRoom,
      title: 'Tên Mới Bởi Admin',
    };

    roomRepository.findById.mockResolvedValue(mockGroupRoom);
    roomRepository.save.mockResolvedValue(updatedProps);

    const result = await useCase.execute(adminId, {
      roomId: validRoomId,
      title: 'Tên Mới Bởi Admin',
    });

    expect(roomRepository.save).toHaveBeenCalledWith(expect.any(RoomEntity));
    const savedEntity = roomRepository.save.mock.calls[0][0];
    expect(savedEntity.getTitle()).toBe('Tên Mới Bởi Admin');
    expect(savedEntity.getAvatar()).toBe(mockGroupRoom.avatar);
    expect(result.title).toBe('Tên Mới Bởi Admin');
  });

  it('nên cập nhật chỉ avatar thành công khi người gọi là ADMIN', async () => {
    const updatedProps: RoomProps = {
      ...mockGroupRoom,
      avatar: 'http://example.com/another-avatar.png',
    };

    roomRepository.findById.mockResolvedValue(mockGroupRoom);
    roomRepository.save.mockResolvedValue(updatedProps);

    const result = await useCase.execute(adminId, {
      roomId: validRoomId,
      avatar: 'http://example.com/another-avatar.png',
    });

    expect(roomRepository.save).toHaveBeenCalledWith(expect.any(RoomEntity));
    const savedEntity = roomRepository.save.mock.calls[0][0];
    expect(savedEntity.getTitle()).toBe(mockGroupRoom.title);
    expect(savedEntity.getAvatar()).toBe(
      'http://example.com/another-avatar.png',
    );
    expect(result.avatar).toBe('http://example.com/another-avatar.png');
  });

  it('nên ném DomainValidationException nếu không cung cấp cả title lẫn avatar', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(superAdminId, {
        roomId: validRoomId,
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu không tìm thấy phòng', async () => {
    roomRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(superAdminId, {
        roomId: validRoomId,
        title: 'Tên Mới',
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
        title: 'Tên Mới',
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu người gọi không thuộc phòng', async () => {
    const strangerId = '999999999999999999999999';
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(strangerId, {
        roomId: validRoomId,
        title: 'Tên Mới',
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu thành viên chỉ có quyền MEMBER', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(regularMemberId, {
        roomId: validRoomId,
        title: 'Tên Mới',
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu title là chuỗi rỗng hoặc toàn khoảng trắng', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(superAdminId, {
        roomId: validRoomId,
        title: '   ',
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên ném DomainValidationException nếu title vượt quá 100 ký tự', async () => {
    roomRepository.findById.mockResolvedValue(mockGroupRoom);

    await expect(
      useCase.execute(superAdminId, {
        roomId: validRoomId,
        title: 'a'.repeat(101),
      }),
    ).rejects.toThrow(DomainValidationException);
  });

  it('nên tập trung tất cả các lỗi nghiệp vụ trong DomainValidationException.errors', () => {
    const roomEntity = RoomEntity.restore(mockGroupRoom);

    try {
      roomEntity.updateGroupProfile(regularMemberId, '   ');
      fail('Cần ném DomainValidationException');
    } catch (err) {
      expect(err).toBeInstanceOf(DomainValidationException);
      const domainErr = err as DomainValidationException;
      expect(domainErr.errors).toBeDefined();
      expect(domainErr.errors.role).toBe(
        'Chỉ quản trị viên mới có quyền cập nhật thông tin phòng',
      );
      expect(domainErr.errors.title).toBe('Tên phòng nhóm không được để trống');
    }
  });

  it('nên kiểm tra chính xác isMember và isAdmin', () => {
    const roomEntity = RoomEntity.restore(mockGroupRoom);

    expect(roomEntity.isMember(superAdminId)).toBe(true);
    expect(roomEntity.isAdmin(superAdminId)).toBe(true);

    expect(roomEntity.isMember(adminId)).toBe(true);
    expect(roomEntity.isAdmin(adminId)).toBe(true);

    expect(roomEntity.isMember(regularMemberId)).toBe(true);
    expect(roomEntity.isAdmin(regularMemberId)).toBe(false);

    expect(roomEntity.isMember('stranger-id')).toBe(false);
    expect(roomEntity.isAdmin('stranger-id')).toBe(false);
  });
});
