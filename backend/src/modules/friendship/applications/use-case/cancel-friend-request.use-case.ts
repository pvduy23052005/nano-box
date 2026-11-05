import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { FriendshipProps } from '../../domain/friendship.type';
import { FriendshipRepositoryAdapter } from '../ports/friendship.port';

export class CancelFriendRequestUseCase {
  constructor(
    private readonly friendshipRepository: FriendshipRepositoryAdapter,
  ) {}

  async execute(userId: string, friendId: string): Promise<FriendshipProps> {
    if (userId === friendId) {
      throw new DomainValidationException(
        'friendId',
        'Không thể tự hủy lời mời kết bạn của chính mình',
      );
    }

    const friendship = await this.friendshipRepository.findBetweenUsers(
      userId,
      friendId,
    );

    if (!friendship) {
      throw new DomainValidationException(
        'friendship',
        'Không tìm thấy lời mời kết bạn',
      );
    }

    friendship.cancel(userId);

    return await this.friendshipRepository.save(friendship);
  }
}
