import { InjectModel } from '@nestjs/mongoose';
import { RoomRepositoryAdapter } from '../application/ports/room.ports';
import { RoomEntity } from '../domain/room.entity';
import { Room, RoomDocument } from './room.schema';
import { Model, Types } from 'mongoose';
import { RoomProps } from '../domain/room.type';
import { MemberStatus, RoomType } from '../domain/chat.enum';
import { RoomMapper } from './room.mapper';
import {
  User,
  UserDocument,
} from '../../user/infrastructure/databases/user.schema';

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

export class RoomRepository implements RoomRepositoryAdapter {
  constructor(
    @InjectModel(Room.name)
    private readonly roomModel: Model<RoomDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async save(room: RoomEntity): Promise<RoomProps> {
    const mongooseRoomData = RoomMapper.toPersistence(room);
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

    const filter: Record<string, any> = {
      members: {
        $elemMatch: {
          user_id: userObjectId,
          status: status,
        },
      },
    };

    const cleanSearch = search?.trim();
    if (cleanSearch) {
      const matchingUsers = await this.userModel
        .find({
          name: { $regex: cleanSearch, $options: 'i' },
          _id: { $ne: userObjectId },
        })
        .select('_id')
        .lean()
        .exec();

      const matchingUserIds = matchingUsers.map((u) => u._id);

      filter.$or = [
        { title: { $regex: cleanSearch, $options: 'i' } },
        {
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

    const mappedRooms = rooms.map((room) => RoomMapper.toProps(room, userId));

    if (cleanSearch) {
      return mappedRooms.filter((room) =>
        room.title?.toLowerCase().includes(cleanSearch.toLowerCase()),
      );
    }

    return mappedRooms;
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
}
