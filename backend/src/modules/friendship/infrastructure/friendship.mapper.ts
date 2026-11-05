import { FriendshipEntity } from '../domain/friendship.entity';
import { FriendshipDocument } from './friendship.schema';
import { FriendshipStatus } from '../domain/friendship.type';
import { Types } from 'mongoose';

export interface FriendshipDocLike {
  _id: Types.ObjectId | string;
  requester_id: Types.ObjectId | string;
  addressee_id: Types.ObjectId | string;
  status: FriendshipStatus;
  created_at?: Date;
  updated_at?: Date;
}

export class FriendshipMapper {
  public static toDomain(
    doc: FriendshipDocument | FriendshipDocLike,
  ): FriendshipEntity {
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
