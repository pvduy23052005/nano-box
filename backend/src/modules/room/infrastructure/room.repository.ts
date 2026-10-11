import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RoomRepositoryAdapter } from '../application/ports/room.ports';
import { RoomEntity } from '../domain/room.entity';
import { Room, RoomDocument } from './room.schema';
import { Model, Types, UpdateQuery, sanitizeFilter } from 'mongoose';
import { RoomProps } from '../domain/room.type';
import { MemberStatus, RoomType } from '../domain/chat.enum';
import { RoomMapper } from './room.mapper';
import {
  User,
  UserDocument,
} from '../../user/infrastructure/databases/user.schema';
import { escapeRegex } from 'src/common/utils/regex.util';

type RoomFilterQuery = Parameters<typeof sanitizeFilter<Room>>[0];

const ROOM_POPULATE_OPTIONS = [
  {
    path: 'members.user_id',
    select: 'name avatar',
  },
  {
    path: 'last_message_id',
    select: 'content created_at sender_id senderId',
  },
];

@Injectable()
export class RoomRepository implements RoomRepositoryAdapter {
  constructor(
    @InjectModel(Room.name)
    private readonly roomModel: Model<RoomDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async save(room: RoomEntity): Promise<RoomProps> {
    const id = room.getId();
    const mongooseRoomData = RoomMapper.toPersistence(room);

    if (id && Types.ObjectId.isValid(id)) {
      const updateData: UpdateQuery<Room> = {
        title: mongooseRoomData.title,
        avatar: mongooseRoomData.avatar,
        type_room: mongooseRoomData.type_room,
      };

      if (mongooseRoomData.last_message_id !== undefined) {
        updateData.last_message_id =
          mongooseRoomData.last_message_id &&
          Types.ObjectId.isValid(mongooseRoomData.last_message_id)
            ? new Types.ObjectId(mongooseRoomData.last_message_id)
            : null;
      }

      if (mongooseRoomData.members !== undefined) {
        updateData.members = mongooseRoomData.members.map((member) => ({
          user_id: Types.ObjectId.isValid(member.user_id)
            ? new Types.ObjectId(member.user_id)
            : member.user_id,
          role: member.role,
          status: member.status,
          ...(member.last_read_message_id &&
          Types.ObjectId.isValid(member.last_read_message_id)
            ? {
                last_read_message_id: new Types.ObjectId(
                  member.last_read_message_id,
                ),
              }
            : {}),
        }));
      }

      const updated = await this.roomModel
        .findByIdAndUpdate(
          id,
          { $set: updateData },
          { returnDocument: 'after' },
        )
        .populate(ROOM_POPULATE_OPTIONS)
        .lean()
        .exec();

      if (updated) {
        return RoomMapper.toProps(updated);
      }
    }

    const roomDoc = new this.roomModel(mongooseRoomData);
    const roomCreated = await roomDoc.save();
    await roomCreated.populate(ROOM_POPULATE_OPTIONS);
    return RoomMapper.toProps(roomCreated);
  }

  async findRoomsByUserIdAndStatus(
    userId: string,
    status: MemberStatus,
    search?: string,
  ): Promise<RoomProps[]> {
    const userObjectId = Types.ObjectId.isValid(userId)
      ? new Types.ObjectId(userId)
      : userId;

    const filter: RoomFilterQuery = {
      members: {
        $elemMatch: {
          user_id: userObjectId,
          status: status,
        },
      },
    };

    const cleanSearch = search?.trim();
    if (cleanSearch) {
      const escapedSearch = escapeRegex(cleanSearch);
      const matchingUsers = await this.userModel
        .find({
          name: { $regex: escapedSearch, $options: 'i' },
          _id: { $ne: userObjectId },
        })
        .select('_id')
        .lean()
        .exec();

      const matchingUserIds = matchingUsers.map((u) => u._id);

      filter.$or = [
        {
          type_room: RoomType.GROUP,
          title: { $regex: escapedSearch, $options: 'i' },
        },
        {
          type_room: RoomType.SINGLE,
          members: {
            $elemMatch: {
              user_id: { $in: matchingUserIds },
            },
          },
        },
      ];
    }

    const rooms = await this.roomModel
      .find(filter)
      .sort({ updated_at: -1 })
      .populate(ROOM_POPULATE_OPTIONS)
      .lean()
      .exec();

    return rooms.map((room) => RoomMapper.toProps(room, userId));
  }

  async checkRoomExist(
    myId: string,
    userId: string,
  ): Promise<RoomProps | null> {
    const myObjectId = Types.ObjectId.isValid(myId)
      ? new Types.ObjectId(myId)
      : myId;
    const userObjectId = Types.ObjectId.isValid(userId)
      ? new Types.ObjectId(userId)
      : userId;

    const room = await this.roomModel
      .findOne({
        type_room: RoomType.SINGLE,
        members: { $size: 2 },
        $and: [
          { 'members.user_id': myObjectId },
          { 'members.user_id': userObjectId },
        ],
      })
      .populate(ROOM_POPULATE_OPTIONS)
      .lean()
      .exec();

    if (!room) {
      return null;
    }

    return RoomMapper.toProps(room, myId);
  }

  async findById(
    roomId: string,
    currentUserId?: string,
  ): Promise<RoomProps | null> {
    if (!Types.ObjectId.isValid(roomId)) {
      return null;
    }

    const room = await this.roomModel
      .findById(roomId)
      .populate(ROOM_POPULATE_OPTIONS)
      .lean()
      .exec();

    if (!room) {
      return null;
    }

    return RoomMapper.toProps(room, currentUserId);
  }

  async updateLastMessageId(roomId: string, messageId: string): Promise<void> {
    if (!Types.ObjectId.isValid(roomId) || !Types.ObjectId.isValid(messageId)) {
      return;
    }

    await this.roomModel.findByIdAndUpdate(roomId, {
      last_message_id: new Types.ObjectId(messageId),
    });
  }

  async updateMemberLastReadMessage(
    roomId: string,
    userId: string,
    messageId: string,
  ): Promise<boolean> {
    if (
      !Types.ObjectId.isValid(roomId) ||
      !Types.ObjectId.isValid(userId) ||
      !Types.ObjectId.isValid(messageId)
    ) {
      return false;
    }

    const rId = new Types.ObjectId(roomId);
    const uId = new Types.ObjectId(userId);
    const mId = new Types.ObjectId(messageId);

    const result = await this.roomModel.updateOne(
      {
        _id: rId,
        members: {
          $elemMatch: {
            user_id: uId,
            $or: [
              { last_read_message_id: null },
              { last_read_message_id: { $lt: mId } },
            ],
          },
        },
      },
      {
        $set: {
          'members.$.last_read_message_id': mId,
        },
      },
    );

    return result.modifiedCount > 0;
  }

  async acceptAllMembers(roomId: string): Promise<RoomProps | null> {
    if (!Types.ObjectId.isValid(roomId)) {
      return null;
    }

    const updated = await this.roomModel
      .findByIdAndUpdate(
        roomId,
        {
          $set: {
            'members.$[].status': MemberStatus.ACCEPTED,
          },
        },
        { returnDocument: 'after' },
      )
      .populate(ROOM_POPULATE_OPTIONS)
      .lean()
      .exec();

    return updated ? RoomMapper.toProps(updated) : null;
  }

  async deleteRoom(roomId: string): Promise<boolean> {
    if (!roomId || !Types.ObjectId.isValid(roomId)) {
      return false;
    }

    const result = await this.roomModel
      .deleteOne({ _id: new Types.ObjectId(roomId) })
      .exec();

    return result.deletedCount > 0;
  }
}
