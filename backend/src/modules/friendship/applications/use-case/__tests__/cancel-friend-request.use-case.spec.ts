import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { FriendshipEntity } from '../../../domain/friendship.entity';
import {
  FriendshipProps,
  FriendshipStatus,
} from '../../../domain/friendship.type';
import { FriendshipRepositoryAdapter } from '../../ports/friendship.port';
import { CancelFriendRequestUseCase } from '../cancel-friend-request.use-case';

describe('CancelFriendRequestUseCase', () => {
  let useCase: CancelFriendRequestUseCase;
  let mockFriendshipRepo: jest.Mocked<FriendshipRepositoryAdapter>;

  const requesterId = 'user-requester-id';
  const addresseeId = 'user-addressee-id';

  beforeEach(() => {
    mockFriendshipRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findBetweenUsers: jest.fn(),
      findPendingReceived: jest.fn(),
    };

    useCase = new CancelFriendRequestUseCase(mockFriendshipRepo);
  });

  it('nên hủy lời mời kết bạn thành công khi lời mời đang PENDING và người gọi là requester', async () => {
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

    const result = await useCase.execute(requesterId, addresseeId);

    expect(result.status).toBe(FriendshipStatus.CANCELLED);
    expect(mockFriendshipRepo.findBetweenUsers).toHaveBeenCalledWith(
      requesterId,
      addresseeId,
    );
    expect(mockFriendshipRepo.save).toHaveBeenCalledWith(friendship);
  });

  it('nên ném lỗi khi tự hủy lời mời kết bạn của chính mình', async () => {
    await expect(useCase.execute(requesterId, requesterId)).rejects.toThrow(
      DomainValidationException,
    );
    expect(mockFriendshipRepo.findBetweenUsers).not.toHaveBeenCalled();
  });

  it('nên ném lỗi khi không tìm thấy lời mời kết bạn', async () => {
    mockFriendshipRepo.findBetweenUsers.mockResolvedValue(null);

    await expect(useCase.execute(requesterId, addresseeId)).rejects.toThrow(
      DomainValidationException,
    );
    expect(mockFriendshipRepo.save).not.toHaveBeenCalled();
  });

  it('nên ném lỗi khi người hủy không phải là người gửi lời mời', async () => {
    const friendship = FriendshipEntity.create(requesterId, addresseeId);
    mockFriendshipRepo.findBetweenUsers.mockResolvedValue(friendship);

    // addressee cố hủy thay vì requester
    await expect(useCase.execute(addresseeId, requesterId)).rejects.toThrow(
      DomainValidationException,
    );
    expect(mockFriendshipRepo.save).not.toHaveBeenCalled();
  });

  it('nên ném lỗi khi lời mời không còn ở trạng thái PENDING', async () => {
    const friendship = FriendshipEntity.create(requesterId, addresseeId);
    friendship.accept(addresseeId);
    mockFriendshipRepo.findBetweenUsers.mockResolvedValue(friendship);

    await expect(useCase.execute(requesterId, addresseeId)).rejects.toThrow(
      DomainValidationException,
    );
    expect(mockFriendshipRepo.save).not.toHaveBeenCalled();
  });
});
