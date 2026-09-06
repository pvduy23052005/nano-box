import { InjectModel } from '@nestjs/mongoose';
import { RoomRepositoryAdapter } from '../application/ports/room.ports';
import { RoomEntity } from '../domain/room.entity';
import { Room, RoomDocument } from './room.schema';
import { Model } from 'mongoose';
import { RoomProps } from '../domain/room.type';
import { MemberStatus } from '../domain/chat.enum';
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
    return RoomMapper.toProps(roomCreated);
  }

  async findRoomsByUserIdAndStatus(
    userId: string,
    status: MemberStatus,
  ): Promise<RoomProps[]> {
    const rooms = await this.roomModel
      .find({
        members: {
          $elemMatch: {
            user_id: userId,
            status: status,
          },
        },
      })
      .populate(ROOM_POPULATE_OPTIONS)
      .lean()
      .exec();

    return rooms.map((room) => RoomMapper.toProps(room, userId));
  }
}
