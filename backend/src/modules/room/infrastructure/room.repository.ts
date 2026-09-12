import { InjectModel } from '@nestjs/mongoose';
import { RoomRepositoryAdapter } from '../application/ports/room.ports';
import { RoomEntity } from '../domain/room.entity';
import { Room, RoomDocument } from './room.schema';
import { Model, Types } from 'mongoose';
import { RoomProps } from '../domain/room.type';
import { MemberStatus, RoomType } from '../domain/chat.enum';
import { RoomMapper } from './room.mapper';

const ROOM_POPULATE_OPTIONS = [
  {
    path: 'members.user_id',
    select: 'name avatar',
  },
];

export class RoomRepository implements RoomRepositoryAdapter {
  constructor(
    @InjectModel(Room.name)
    private readonly roomModel: Model<RoomDocument>,
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
  ): Promise<RoomProps[]> {
    const userObjectId = Types.ObjectId.isValid(userId)
      ? new Types.ObjectId(userId)
      : userId;

    const rooms = await this.roomModel
      .find({
        members: {
          $elemMatch: {
            user_id: userObjectId,
            status: status,
          },
        },
      })
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
}
