import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { UserEntity } from 'src/modules/user/domain/user.entity';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import { FriendshipEntity } from '../../../domain/friendship.entity';
import {
  FriendshipProps,
  FriendshipStatus,
} from '../../../domain/friendship.type';
import { FriendshipRepositoryAdapter } from '../../ports/friendship.port';
import { SendFriendRequestUseCase } from '../send-friend-request.use-case';
import { EnsureFriendRoomUseCase } from 'src/modules/room/application/use-cases/ensure-friend-room.use-case';

describe('SendFriendRequestUseCase', () => {
  let useCase: SendFriendRequestUseCase;
  let mockFriendshipRepo: jest.Mocked<FriendshipRepositoryAdapter>;
  let mockUserRepo: jest.Mocked<UserRepositoryAdapter>;
  let mockEnsureFriendRoomUseCase: jest.Mocked<EnsureFriendRoomUseCase>;

  const requesterId = 'user-requester-id';
  const addresseeId = 'user-addressee-id';

  const mockRequesterUser = UserEntity.restore({
    id: requesterId,
    name: 'Requester User',
    email: 'requester@example.com',
    password: 'hashed-password',
    status: 'ACTIVE',
  });

  const mockTargetUser = UserEntity.restore({
    id: addresseeId,
    name: 'Addressee User',
    email: 'addressee@example.com',
    password: 'hashed-password',
    status: 'ACTIVE',
  });

  beforeEach(() => {
    mockFriendshipRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findBetweenUsers: jest.fn(),
    } as unknown as jest.Mocked<FriendshipRepositoryAdapter>;

    mockUserRepo = {
      save: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn().mockImplementation(async (id: string) => {
        if (id === requesterId) return mockRequesterUser;
        if (id === addresseeId) return mockTargetUser;
        return null;
      }),
      findAll: jest.fn(),
    };

    mockEnsureFriendRoomUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<EnsureFriendRoomUseCase>;

    useCase = new SendFriendRequestUseCase(
      mockFriendshipRepo,
      mockUserRepo,
      mockEnsureFriendRoomUseCase,
    );
  });

  it('nên gửi lời mời kết bạn thành công khi chưa từng có quan hệ trước đó', async () => {
    mockFriendshipRepo.findBetweenUsers.mockResolvedValue(null);

    const savedProps: FriendshipProps = {
      id: 'friendship-id-1',
      requesterId,
      addresseeId,
      status: FriendshipStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockFriendshipRepo.save.mockResolvedValue(savedProps);

    const result = await useCase.execute(requesterId, addresseeId);

    expect(mockUserRepo.findById).toHaveBeenCalledWith(requesterId);
    expect(mockUserRepo.findById).toHaveBeenCalledWith(addresseeId);
    expect(mockFriendshipRepo.findBetweenUsers).toHaveBeenCalledWith(
      requesterId,
      addresseeId,
    );
    expect(mockFriendshipRepo.save).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('friendship-id-1');
    expect(result.status).toBe(FriendshipStatus.PENDING);
    expect(result.requesterId).toBe(requesterId);
    expect(result.addresseeId).toBe(addresseeId);
    expect(result.requesterName).toBe('Requester User');
    expect(result.requesterEmail).toBe('requester@example.com');
  });

  it('nên chạy song song findById và findBetweenUsers bằng Promise.all', async () => {
    let requesterFound = false;
    let addresseeFound = false;
    let findBetweenUsersCalled = false;

    mockUserRepo.findById.mockImplementation(async (id: string) => {
      if (id === requesterId) {
        requesterFound = true;
        return mockRequesterUser;
      }
      if (id === addresseeId) {
        addresseeFound = true;
        return mockTargetUser;
      }
      return null;
    });

    mockFriendshipRepo.findBetweenUsers.mockImplementation(async () => {
      findBetweenUsersCalled = true;
      return null;
    });

    const savedProps: FriendshipProps = {
      id: 'friendship-id-1',
      requesterId,
      addresseeId,
      status: FriendshipStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockFriendshipRepo.save.mockResolvedValue(savedProps);

    await useCase.execute(requesterId, addresseeId);

    expect(requesterFound).toBe(true);
    expect(addresseeFound).toBe(true);
    expect(findBetweenUsersCalled).toBe(true);
  });

  it('nên tự động chấp nhận và trở thành bạn bè khi đối phương đã gửi lời mời trước đó', async () => {
    mockUserRepo.findById.mockResolvedValue(mockTargetUser);

    const existing = FriendshipEntity.restore({
      id: 'existing-id',
      requesterId: addresseeId,
      addresseeId: requesterId,
      status: FriendshipStatus.PENDING,
    });
    mockFriendshipRepo.findBetweenUsers.mockResolvedValue(existing);

    const savedProps: FriendshipProps = {
      id: 'existing-id',
      requesterId: addresseeId,
      addresseeId: requesterId,
      status: FriendshipStatus.ACCEPTED,
    };
    mockFriendshipRepo.save.mockResolvedValue(savedProps);

    const result = await useCase.execute(requesterId, addresseeId);

    expect(existing.getStatus()).toBe(FriendshipStatus.ACCEPTED);
    expect(mockFriendshipRepo.save).toHaveBeenCalledWith(existing);
    expect(result.status).toBe(FriendshipStatus.ACCEPTED);
    expect(mockEnsureFriendRoomUseCase.execute).toHaveBeenCalledWith(
      requesterId,
      addresseeId,
    );
  });

  it('nên ném lỗi khi chính người gửi đã gửi lời mời trước đó và đang PENDING', async () => {
    mockUserRepo.findById.mockResolvedValue(mockTargetUser);

    // Chính user này đã gửi lời mời trước đó
    const existing = FriendshipEntity.restore({
      id: 'existing-id',
      requesterId,
      addresseeId,
      status: FriendshipStatus.PENDING,
    });
    mockFriendshipRepo.findBetweenUsers.mockResolvedValue(existing);

    let caughtError: DomainValidationException | null = null;
    try {
      await useCase.execute(requesterId, addresseeId);
    } catch (err) {
      caughtError = err as DomainValidationException;
    }

    expect(caughtError).toBeInstanceOf(DomainValidationException);
    expect(caughtError?.errors.status).toContain('Bạn đã gửi lời mời kết bạn');
    expect(mockFriendshipRepo.save).not.toHaveBeenCalled();
  });

  it('nên ném lỗi khi hai người đã là bạn bè', async () => {
    mockUserRepo.findById.mockResolvedValue(mockTargetUser);
    const existing = FriendshipEntity.restore({
      id: 'existing-id',
      requesterId,
      addresseeId,
      status: FriendshipStatus.ACCEPTED,
    });
    mockFriendshipRepo.findBetweenUsers.mockResolvedValue(existing);

    await expect(useCase.execute(requesterId, addresseeId)).rejects.toThrow(
      DomainValidationException,
    );
    expect(mockFriendshipRepo.save).not.toHaveBeenCalled();
  });

  it('nên ném lỗi khi tự gửi lời mời cho chính mình', async () => {
    mockUserRepo.findById.mockResolvedValue(mockTargetUser);
    mockFriendshipRepo.findBetweenUsers.mockResolvedValue(null);

    await expect(useCase.execute(requesterId, requesterId)).rejects.toThrow(
      DomainValidationException,
    );
    expect(mockFriendshipRepo.save).not.toHaveBeenCalled();
  });

  it('nên ném lỗi khi người nhận không tồn tại (chạy song song findById và findBetweenUsers)', async () => {
    mockUserRepo.findById.mockImplementation(async (id: string) => {
      if (id === requesterId) return mockRequesterUser;
      return null;
    });
    mockFriendshipRepo.findBetweenUsers.mockResolvedValue(null);

    await expect(useCase.execute(requesterId, addresseeId)).rejects.toThrow(
      DomainValidationException,
    );
    expect(mockUserRepo.findById).toHaveBeenCalledWith(requesterId);
    expect(mockUserRepo.findById).toHaveBeenCalledWith(addresseeId);
    expect(mockFriendshipRepo.findBetweenUsers).toHaveBeenCalledWith(
      requesterId,
      addresseeId,
    );
    expect(mockFriendshipRepo.save).not.toHaveBeenCalled();
  });

  it('nên ném lỗi khi người gửi không tồn tại', async () => {
    mockUserRepo.findById.mockImplementation(async (id: string) => {
      if (id === addresseeId) return mockTargetUser;
      return null;
    });
    mockFriendshipRepo.findBetweenUsers.mockResolvedValue(null);

    await expect(useCase.execute(requesterId, addresseeId)).rejects.toThrow(
      DomainValidationException,
    );
    expect(mockFriendshipRepo.save).not.toHaveBeenCalled();
  });
});
