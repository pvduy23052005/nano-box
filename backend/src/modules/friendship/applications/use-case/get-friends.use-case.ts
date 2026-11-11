import { UserProfile } from 'src/modules/user/applications/dto/user.dto';
import { FriendshipRepositoryAdapter } from '../ports/friendship.port';

export class GetFriendsUseCase {
  constructor(
    private readonly friendshipRepository: FriendshipRepositoryAdapter,
  ) {}

  async execute(userId: string, search?: string): Promise<UserProfile[]> {
    return await this.friendshipRepository.findFriends(userId, search);
  }
}
