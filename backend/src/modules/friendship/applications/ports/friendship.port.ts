import { FriendshipEntity } from '../../domain/friendship.entity';
import {
  FriendshipProps,
  ReceivedFriendRequestProps,
} from '../../domain/friendship.type';

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
}
