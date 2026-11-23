import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { FriendshipEntity } from '../../../domain/friendship.entity';
import {
  FriendshipProps,
  FriendshipStatus,
} from '../../../domain/friendship.type';
import { FriendshipRepositoryAdapter } from '../../ports/friendship.port';
import { AcceptFriendRequestUseCase } from '../accept-friend-request.use-case';
import { EnsureFriendRoomUseCase } from 'src/modules/room/application/use-cases/ensure-friend-room.use-case';

describe('AcceptFriendRequestUseCase', () => {
  let useCase: AcceptFriendRequestUseCase;
  let mockFriendshipRepo: jest.Mocked<FriendshipRepositoryAdapter>;
  let mockEnsureFriendRoomUseCase: jest.Mocked<EnsureFriendRoomUseCase>;

  const requesterId = 'user-requester-id';
  const addresseeId = 'user-addressee-id';

  beforeEach(() => {
    mockFriendshipRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findBetweenUsers: jest.fn(),
      findPendingReceived: jest.fn(),
    };

    mockEnsureFriendRoomUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<EnsureFriendRoomUseCase>;

    useCase = new AcceptFriendRequestUseCase(
      mockFriendshipRepo,
      mockEnsureFriendRoomUseCase,
    );
  });

  it('nên chấp nhận lời mời kết bạn thành công khi lời mời đang PENDING và người gọi là addressee', async () => {
    const friendship = FriendshipEntity.create(requesterId, addresseeId);
    mockFriendshipRepo.findBetweenUsers.mockResolvedValue(friendship);
    mockFriendshipRepo.save.mockImplementation(
      async (entity: FriendshipEntity): Promise<FriendshipProps> => ({
        id: 'friendship-id-1',
        requesterId: entity.getRequesterId(),
        addresseeId: entity.getAddresseeId(),
        status: entity.getStatus(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute(addresseeId, requesterId);

    expect(result.status).toBe(FriendshipStatus.ACCEPTED);
    expect(mockFriendshipRepo.findBetweenUsers).toHaveBeenCalledWith(
      addresseeId,
      requesterId,
    );
    expect(mockFriendshipRepo.save).toHaveBeenCalledWith(friendship);
    expect(mockEnsureFriendRoomUseCase.execute).toHaveBeenCalledWith(
      addresseeId,
      requesterId,
    );
  });

  it('nên ném lỗi khi tự chấp nhận lời mời kết bạn của chính mình', async () => {
    await expect(useCase.execute(addresseeId, addresseeId)).rejects.toThrow(
      DomainValidationException,
    );
    expect(mockFriendshipRepo.findBetweenUsers).not.toHaveBeenCalled();
  });

  it('nên ném lỗi khi không tìm thấy lời mời kết bạn', async () => {
    mockFriendshipRepo.findBetweenUsers.mockResolvedValue(null);

    await expect(useCase.execute(addresseeId, requesterId)).rejects.toThrow(
      DomainValidationException,
    );
    expect(mockFriendshipRepo.save).not.toHaveBeenCalled();
  });

  it('nên ném lỗi khi người chấp nhận không phải là người nhận lời mời', async () => {
    const friendship = FriendshipEntity.create(requesterId, addresseeId);
    mockFriendshipRepo.findBetweenUsers.mockResolvedValue(friendship);

    // requester cố chấp nhận thay vì addressee
    await expect(useCase.execute(requesterId, addresseeId)).rejects.toThrow(
      DomainValidationException,
    );
    expect(mockFriendshipRepo.save).not.toHaveBeenCalled();
  });

  it('nên ném lỗi khi lời mời không còn ở trạng thái PENDING', async () => {
    const friendship = FriendshipEntity.create(requesterId, addresseeId);
    friendship.accept(addresseeId);
    mockFriendshipRepo.findBetweenUsers.mockResolvedValue(friendship);

    await expect(useCase.execute(addresseeId, requesterId)).rejects.toThrow(
      DomainValidationException,
    );
    expect(mockFriendshipRepo.save).not.toHaveBeenCalled();
  });
});
