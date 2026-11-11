import { CreateSingleRoomUseCase } from '../create-single-room';
import { RoomRepositoryAdapter } from '../../ports/room.ports';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import { UserEntity } from 'src/modules/user/domain/user.entity';
import { UserStatus } from 'src/modules/user/domain/user.type';
import { RoomProps } from '../../../domain/room.type';
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
  deleteRoom: jest.fn(),
  isMessageInRoom: jest.fn(),
  findRoomMembers: jest.fn(),
  findRoomMembersWithProfile: jest.fn(),
  findRelatedUserIdsByRooms: jest.fn(),
});

const makeMockUserRepository = (): jest.Mocked<UserRepositoryAdapter> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
  findUsers: jest.fn(),
});

describe('CreateSingleRoomUseCase', () => {
  let useCase: CreateSingleRoomUseCase;
  let roomRepository: jest.Mocked<RoomRepositoryAdapter>;
  let userRepository: jest.Mocked<UserRepositoryAdapter>;

  const myId = '654321654321654321654321';
  const userId = '123456123456123456123456';

  const mockTargetUser = UserEntity.restore({
    id: userId,
    name: 'Target User',
    email: 'target@example.com',
    password: 'hashed-password',
    avatar: 'https://example.com/avatar.png',
    status: UserStatus.ACTIVE,
  });

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
    userRepository = makeMockUserRepository();
    userRepository.findById.mockResolvedValue(mockTargetUser);
    useCase = new CreateSingleRoomUseCase(roomRepository, userRepository);
  });

  it('nên ném lỗi nếu userId rỗng', async () => {
    await expect(useCase.execute(myId, '   ')).rejects.toThrow(
      DomainValidationException,
    );
  });

  it('nên ném lỗi nếu tự tạo cuộc trò chuyện với chính mình', async () => {
    await expect(useCase.execute(myId, myId)).rejects.toThrow(
      DomainValidationException,
    );
  });

  it('nên ném lỗi nếu người dùng đích không tồn tại', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(myId, userId)).rejects.toThrow(
      DomainValidationException,
    );
  });

  it('nên trả về phòng đã tồn tại nếu tìm thấy và không gọi save', async () => {
    roomRepository.checkRoomExist.mockResolvedValue(mockExistingRoom);

    const result = await useCase.execute(myId, userId);

    expect(userRepository.findById).toHaveBeenCalledWith(userId);
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

    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(roomRepository.checkRoomExist).toHaveBeenCalledTimes(1);
    expect(roomRepository.checkRoomExist).toHaveBeenCalledWith(myId, userId);
    expect(roomRepository.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCreatedRoom);
  });
});
