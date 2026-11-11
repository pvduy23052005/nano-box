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
  ) {}

  async execute(
    requesterId: string,
    addresseeId: string,
  ): Promise<SendFriendRequestOutputProps> {
    const inputErrors: Record<string, string> = {};

    if (!requesterId) {
      inputErrors.requesterId = 'Người gửi không được để trống';
    }

    if (!addresseeId) {
      inputErrors.addresseeId = 'Người nhận không được để trống';
    }

    if (requesterId && addresseeId && requesterId === addresseeId) {
      inputErrors.addresseeId = 'Không thể gửi lời mời cho chính mình';
    }

    if (Object.keys(inputErrors).length > 0) {
      throw new DomainValidationException(inputErrors);
    }

    const [requester, addressee, friendship] = await Promise.all([
      this.userRepository.findById(requesterId),
      this.userRepository.findById(addresseeId),
      this.friendshipRepository.findBetweenUsers(requesterId, addresseeId),
    ]);

    if (!requester || !addressee) {
      const entityErrors: Record<string, string> = {};

      if (!requester) {
        entityErrors.requesterId = 'Người dùng gửi lời mời không tồn tại';
      }

      if (!addressee) {
        entityErrors.addresseeId = 'Người dùng nhận lời mời không tồn tại';
      }

      throw new DomainValidationException(entityErrors);
    }

    const requesterProfile = {
      requesterName: requester.getName() ?? 'Người dùng',
      requesterAvatar: requester.getAvatar() ?? null,
      requesterEmail: requester.getEmail(),
    };

    if (!friendship) {
      const newFriendship = FriendshipEntity.create(requesterId, addresseeId);
      const saved = await this.friendshipRepository.save(newFriendship);

      return {
        ...saved,
        ...requesterProfile,
      };
    }

    if (friendship.isAccepted()) {
      throw new DomainValidationException('status', 'Hai người đã là bạn bè');
    }

    if (friendship.isPending()) {
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

    friendship.resend(requesterId, addresseeId);
    const saved = await this.friendshipRepository.save(friendship);
    return {
      ...saved,
      ...requesterProfile,
    };
  }
}
