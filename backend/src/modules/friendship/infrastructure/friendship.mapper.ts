import { FriendshipEntity } from '../domain/friendship.entity';
import { FriendshipDocument } from './friendship.schema';

export class FriendshipMapper {
  public static toDomain(doc: FriendshipDocument): FriendshipEntity {
    return FriendshipEntity.restore({
      id: doc._id.toString(),
      requesterId: doc.requester_id.toString(),
      addresseeId: doc.addressee_id.toString(),
      status: doc.status,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    });
  }

  public static toPersistence(entity: FriendshipEntity) {
    return {
      requester_id: entity.getRequesterId(),
      addressee_id: entity.getAddresseeId(),
      status: entity.getStatus(),
    };
  }
}
