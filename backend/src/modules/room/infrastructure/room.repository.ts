import { InjectModel } from '@nestjs/mongoose';
import { RoomRepositoryAdapter } from '../application/ports/room.ports';
import { RoomEntity } from '../domain/room.entity';
import { Room, RoomDocument } from './room.schema';
import { Model } from 'mongoose';
import { RoomProps } from '../domain/room.type';
import { MemberStatus, RoomType } from '../domain/chat.enum';

export class RoomRepository implements RoomRepositoryAdapter {
  constructor(
    @InjectModel(Room.name)
    private readonly roomModel: Model<RoomDocument>,
  ) {}

  private toProps(doc: RoomDocument, currentUserId?: string): RoomProps {
    let avatar = doc.avatar;
    let title = doc.title;

    if (doc.type_room === RoomType.SINGLE && currentUserId) {
      const otherMember = doc.members.find((member) => {
        const memberUserId =
          (member.user_id as any)?._id?.toString() ||
          member.user_id?.toString();
        return memberUserId && memberUserId !== currentUserId;
      });

      if (otherMember) {
        const otherUser = otherMember.user_id as any;
        if (otherUser && typeof otherUser === 'object') {
          if (!avatar && otherUser.avatar) {
            avatar = otherUser.avatar;
          }
          if (!title && otherUser.name) {
            title = otherUser.name;
          }
        }
      }
    }

    return {
      id: doc._id.toString(),
      title: title,
      typeRoom: doc.type_room,
      lastMessageId: doc.last_message_id?.toString() || null,
      avatar: avatar,
      members: doc.members.map((member) => {
        const memberUserId =
          (member.user_id as any)?._id?.toString() ||
          member.user_id?.toString() ||
          '';
        return {
          userId: memberUserId,
          role: member.role,
          status: member.status,
        };
      }),
    };
  }

  private toDatabaseFormat(room: RoomEntity) {
    const roomData = room.toObject();
    return {
      title: roomData.title,
      type_room: roomData.typeRoom,
      last_message_id: roomData.lastMessageId,
      avatar: roomData.avatar,
      members: roomData.members.map((member) => ({
        user_id: member.userId,
        role: member.role,
        status: member.status,
      })),
    };
  }

  async save(room: RoomEntity): Promise<RoomProps> {
    const mongooseRoomData = this.toDatabaseFormat(room);
    const roomDoc = new this.roomModel(mongooseRoomData);
    const roomCreated = await roomDoc.save();
    return this.toProps(roomCreated);
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
      .populate('members.user_id')
      .exec();

    return rooms.map((room) => this.toProps(room, userId));
  }
}

