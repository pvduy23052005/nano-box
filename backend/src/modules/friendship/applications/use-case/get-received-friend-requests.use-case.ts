import { ReceivedFriendRequestProps } from '../../domain/friendship.type';
import { FriendshipRepositoryAdapter } from '../ports/friendship.port';

export class GetReceivedFriendRequestsUseCase {
  constructor(
    private readonly friendshipRepository: FriendshipRepositoryAdapter,
  ) {}

  async execute(userId: string): Promise<ReceivedFriendRequestProps[]> {
    return await this.friendshipRepository.findPendingReceived(userId);
  }
}
