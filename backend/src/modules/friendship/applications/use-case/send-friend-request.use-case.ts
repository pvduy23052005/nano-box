import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import { FriendshipEntity } from '../../domain/friendship.entity';
import { FriendshipProps } from '../../domain/friendship.type';
import { FriendshipRepositoryAdapter } from '../ports/friendship.port';
import { EnsureFriendRoomUseCase } from 'src/modules/room/application/use-cases/ensure-friend-room.use-case';

export class SendFriendRequestUseCase {
  constructor(
    private readonly friendshipRepository: FriendshipRepositoryAdapter,
    private readonly userRepository: UserRepositoryAdapter,
    private readonly ensureFriendRoomUseCase: EnsureFriendRoomUseCase,
  ) {}

  async execute(
    requesterId: string,
    addresseeId: string,
  ): Promise<FriendshipProps> {
    const addressee = await this.userRepository.findById(addresseeId);
    if (!addressee) {
      throw new DomainValidationException(
        'addresseeId',
        'Người dùng nhận lời mời không tồn tại',
      );
    }

    const friendship = await this.friendshipRepository.findBetweenUsers(
      requesterId,
      addresseeId,
    );

    if (friendship?.isAccepted()) {
      throw new DomainValidationException('status', 'Hai người đã là bạn bè');
    }

    if (friendship?.isPending()) {
      if (friendship.getRequesterId() === requesterId) {
        throw new DomainValidationException(
          'status',
          'Bạn đã gửi lời mời kết bạn cho người này rồi',
        );
      }

      friendship.accept(requesterId);
      const saved = await this.friendshipRepository.save(friendship);
      await this.ensureFriendRoomUseCase.execute(requesterId, addresseeId);
      return saved;
    }

    const newFriendship = FriendshipEntity.create(requesterId, addresseeId);
    return await this.friendshipRepository.save(newFriendship);
  }
}
