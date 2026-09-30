import {
  FriendshipProps,
  FriendshipStatus,
  ReceivedFriendRequestProps,
} from '../domain/friendship.type';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { FriendshipMapper } from './friendship.mapper';
import { FriendshipEntity } from '../domain/friendship.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Friendship, FriendshipDocument } from './friendship.schema';
import { FriendshipRepositoryAdapter } from '../applications/ports/friendship.port';

interface PopulatedRequester {
  _id: Types.ObjectId | string;
  name?: string;
  email?: string;
  avatar?: string;
}

@Injectable()
export class FriendshipRepository implements FriendshipRepositoryAdapter {
  constructor(
    @InjectModel(Friendship.name)
    private readonly friendshipModel: Model<FriendshipDocument>,
  ) {}

  async save(friendship: FriendshipEntity): Promise<FriendshipProps> {
    const friendshipId = friendship.getId();
    const persistenceData = FriendshipMapper.toPersistence(friendship);

    if (friendshipId) {
      const updated = await this.friendshipModel.findByIdAndUpdate(
        friendshipId,
        persistenceData,
        { returnDocument: 'after' },
      );

      if (!updated) {
        throw new NotFoundException('Không tìm thấy lời mời kết bạn');
      }

      return {
        id: updated._id.toString(),
        requesterId: updated.requester_id.toString(),
        addresseeId: updated.addressee_id.toString(),
        status: updated.status,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      };
    }

    const saved = await this.friendshipModel.findOneAndUpdate(
      {
        $or: [
          {
            requester_id: persistenceData.requester_id,
            addressee_id: persistenceData.addressee_id,
          },
          {
            requester_id: persistenceData.addressee_id,
            addressee_id: persistenceData.requester_id,
          },
        ],
      },
      persistenceData,
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
    );

    return {
      id: saved._id.toString(),
      requesterId: saved.requester_id.toString(),
      addresseeId: saved.addressee_id.toString(),
      status: saved.status,
      createdAt: saved.created_at,
      updatedAt: saved.updated_at,
    };
  }

  async findById(friendshipId: string): Promise<FriendshipEntity | null> {
    if (!friendshipId || !Types.ObjectId.isValid(friendshipId)) {
      return null;
    }

    const doc = await this.friendshipModel.findById(friendshipId).exec();
    return doc ? FriendshipMapper.toDomain(doc) : null;
  }

  async findBetweenUsers(
    user1Id: string,
    user2Id: string,
  ): Promise<FriendshipEntity | null> {
    if (!user1Id || !user2Id) {
      return null;
    }

    const doc = await this.friendshipModel
      .findOne({
        $or: [
          { requester_id: user1Id, addressee_id: user2Id },
          { requester_id: user2Id, addressee_id: user1Id },
        ],
      })
      .exec();

    return doc ? FriendshipMapper.toDomain(doc) : null;
  }

  async findPendingReceived(
    userId: string,
  ): Promise<ReceivedFriendRequestProps[]> {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return [];
    }

    const docs = await this.friendshipModel
      .find({
        addressee_id: userId,
        status: FriendshipStatus.PENDING,
      })
      .populate<{ requester_id: PopulatedRequester }>(
        'requester_id',
        'name email avatar',
      )
      .sort({ created_at: -1 })
      .lean()
      .exec();

    return docs
      .filter((doc): doc is typeof doc & { requester_id: PopulatedRequester } =>
        Boolean(
          doc.requester_id &&
          typeof doc.requester_id === 'object' &&
          '_id' in doc.requester_id,
        ),
      )
      .map((doc) => ({
        id: doc._id.toString(),
        sender: {
          id: doc.requester_id._id.toString(),
          name: doc.requester_id.name ?? '',
          email: doc.requester_id.email ?? '',
          avatar: doc.requester_id.avatar ?? '',
        },
        createdAt: doc.created_at,
      }));
  }
}
