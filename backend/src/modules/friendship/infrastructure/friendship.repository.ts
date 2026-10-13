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

import {
  User,
  UserDocument,
} from '../../user/infrastructure/databases/user.schema';
import { UserProfile } from 'src/modules/user/applications/dto/user.dto';
import { escapeRegex } from 'src/common/utils/regex.util';

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
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async save(friendship: FriendshipEntity): Promise<FriendshipProps> {
    const friendshipId = friendship.getId();
    const persistenceData = FriendshipMapper.toPersistence(friendship);

    if (friendshipId) {
      const updated = await this.friendshipModel
        .findByIdAndUpdate(
          friendshipId,
          persistenceData,
          { returnDocument: 'after' },
        )
        .lean()
        .exec();

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

    const saved = await this.friendshipModel
      .findOneAndUpdate(
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
      )
      .lean()
      .exec();

    if (!saved) {
      throw new NotFoundException('Không thể lưu lời mời kết bạn');
    }

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

    const doc = await this.friendshipModel
      .findById(friendshipId)
      .lean()
      .exec();
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
      .lean()
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

  async findFriends(userId: string, search?: string): Promise<UserProfile[]> {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return [];
    }

    const friendships = await this.friendshipModel
      .find({
        status: FriendshipStatus.ACCEPTED,
        $or: [{ requester_id: userId }, { addressee_id: userId }],
      })
      .select('requester_id addressee_id')
      .lean()
      .exec();

    if (!friendships || friendships.length === 0) {
      return [];
    }

    const friendIds = friendships.map((friendship) =>
      friendship.requester_id.toString() === userId
        ? friendship.addressee_id.toString()
        : friendship.requester_id.toString(),
    );

    const cleanSearch = search?.trim();
    const users = await this.userModel
      .find({
        _id: { $in: friendIds },
        ...(cleanSearch
          ? { name: { $regex: escapeRegex(cleanSearch), $options: 'i' } }
          : {}),
      })
      .select('name email avatar')
      .lean()
      .exec();

    return users.map((user) => ({
      id: user._id.toString(),
      name: user.name ?? '',
      email: user.email ?? '',
      avatar: user.avatar ?? '',
    }));
  }

  async checkAllAreFriends(
    userId: string,
    memberIds: string[],
  ): Promise<boolean> {
    if (!userId || !memberIds || memberIds.length === 0) {
      return false;
    }

    const uniqueMemberIds = Array.from(
      new Set(memberIds.filter((id) => id && id !== userId)),
    );

    if (uniqueMemberIds.length === 0) {
      return false;
    }

    const friendships = await this.friendshipModel
      .find({
        status: FriendshipStatus.ACCEPTED,
        $or: [
          {
            requester_id: userId,
            addressee_id: { $in: uniqueMemberIds },
          },
          {
            requester_id: { $in: uniqueMemberIds },
            addressee_id: userId,
          },
        ],
      })
      .select('requester_id addressee_id')
      .lean()
      .exec();

    const foundFriendIds = new Set<string>();
    for (const friendship of friendships) {
      const friendId =
        friendship.requester_id.toString() === userId
          ? friendship.addressee_id.toString()
          : friendship.requester_id.toString();
      foundFriendIds.add(friendId);
    }

    return uniqueMemberIds.every((id) => foundFriendIds.has(id));
  }
}
