import { FriendshipEntity } from '../../domain/friendship.entity';
import {
  FriendshipProps,
  ReceivedFriendRequestProps,
} from '../../domain/friendship.type';
import { UserProfile } from 'src/modules/user/applications/dto/user.dto';

export abstract class FriendshipRepositoryAdapter {
  abstract save(friendship: FriendshipEntity): Promise<FriendshipProps>;

  abstract findById(id: string): Promise<FriendshipEntity | null>;

  abstract findBetweenUsers(
    user1Id: string,
    user2Id: string,
  ): Promise<FriendshipEntity | null>;

  abstract findPendingReceived(
    userId: string,
  ): Promise<ReceivedFriendRequestProps[]>;

  abstract findFriends(userId: string, search?: string): Promise<UserProfile[]>;

  abstract checkAllAreFriends(
    userId: string,
    memberIds: string[],
  ): Promise<boolean>;
}
