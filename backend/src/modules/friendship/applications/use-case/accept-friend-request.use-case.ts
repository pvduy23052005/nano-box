import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { FriendshipProps } from '../../domain/friendship.type';
import { FriendshipRepositoryAdapter } from '../ports/friendship.port';
import { EnsureFriendRoomUseCase } from 'src/modules/room/application/use-cases/ensure-friend-room.use-case';

export class AcceptFriendRequestUseCase {
  constructor(
    private readonly friendshipRepository: FriendshipRepositoryAdapter,
    private readonly ensureFriendRoomUseCase: EnsureFriendRoomUseCase,
  ) {}

  async execute(userId: string, friendId: string): Promise<FriendshipProps> {
    if (userId === friendId) {
      throw new DomainValidationException(
        'friendId',
        'Không thể tự chấp nhận lời mời kết bạn của chính mình',
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

    friendship.accept(userId);

    const savedFriendship = await this.friendshipRepository.save(friendship);

    await this.ensureFriendRoomUseCase.execute(userId, friendId);

    return savedFriendship;
  }
}
