import { DomainValidationException } from 'src/common/customs/domain-validation.exception';
import { UserRepositoryAdapter } from 'src/modules/user/applications/ports/user.port';
import { FriendshipEntity } from '../../domain/friendship.entity';
import { FriendshipProps } from '../../domain/friendship.type';
import { FriendshipRepositoryAdapter } from '../ports/friendship.port';
import { EnsureFriendRoomUseCase } from 'src/modules/room/application/use-cases/ensure-friend-room.use-case';

export interface SendFriendRequestOutputProps extends FriendshipProps {
  requesterName?: string;
  requesterAvatar?: string | null;
  requesterEmail?: string;
}

export class SendFriendRequestUseCase {
  constructor(
    private readonly friendshipRepository: FriendshipRepositoryAdapter,
    private readonly userRepository: UserRepositoryAdapter,
    private readonly ensureFriendRoomUseCase: EnsureFriendRoomUseCase,
  ) { }

  async execute(
    requesterId: string,
    addresseeId: string,
  ): Promise<SendFriendRequestOutputProps> {
    const [requester, addressee, friendship] = await Promise.all([
      this.userRepository.findById(requesterId),
      this.userRepository.findById(addresseeId),
      this.friendshipRepository.findBetweenUsers(requesterId, addresseeId),
    ]);

    if (!requester) {
      throw new DomainValidationException(
        'requesterId',
        'Người dùng gửi lời mời không tồn tại',
      );
    }

    if (!addressee) {
      throw new DomainValidationException(
        'addresseeId',
        'Người dùng nhận lời mời không tồn tại',
      );
    }

    const requesterProfile = {
      requesterName: requester.getName() ?? 'Người dùng',
      requesterAvatar: requester.getAvatar() ?? null,
      requesterEmail: requester.getEmail() ?? undefined,
    };

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
      return {
        ...saved,
        ...requesterProfile,
      };
    }

    const newFriendship = FriendshipEntity.create(requesterId, addresseeId);
    const saved = await this.friendshipRepository.save(newFriendship);
    return {
      ...saved,
      ...requesterProfile,
    };
  }
}
