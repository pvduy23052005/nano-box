import { Types } from 'mongoose';
import { RoomEntity } from '../domain/room.entity';
import { RoomProps } from '../domain/room.type';
import { RoomType, MemberRole, MemberStatus } from '../domain/chat.enum';

export interface PopulatedUser {
  _id: Types.ObjectId;
  name?: string;
  avatar?: string | null;
}

export interface MemberItem {
  user_id: PopulatedUser;
  role: MemberRole;
  status: MemberStatus;
  joined_at?: Date;
}

export interface RawRoomInput {
  _id: Types.ObjectId | string;
  title: string | null;
  type_room: RoomType;
  last_message_id: Types.ObjectId | null;
  avatar: string | null;
  members: MemberItem[];
}

const getMemberUserId = (
  userId: Types.ObjectId | PopulatedUser | string,
): string => {
  if (!userId) return '';
  if (typeof userId === 'string') return userId;
  if (typeof userId === 'object') {
    if ('_id' in userId && userId._id) return userId._id.toString();
    return userId.toString();
  }
  return '';
};

const isPopulatedUser = (
  user: Types.ObjectId | PopulatedUser,
): user is PopulatedUser => {
  return (
    typeof user === 'object' &&
    user !== null &&
    ('name' in user || 'avatar' in user || 'fullName' in user)
  );
};

export class RoomMapper {
  public static toProps(
    rawRoom: RawRoomInput,
    currentUserId?: string,
  ): RoomProps {
    let title: string | null = rawRoom.title ?? null;
    let avatar: string = rawRoom.avatar || '/images/default-avatar.webp';

    const typeRoom: RoomType = rawRoom.type_room || RoomType.SINGLE;

    if (typeRoom === RoomType.SINGLE && currentUserId) {
      const otherMember = rawRoom.members?.find((member) => {
        const memberId = getMemberUserId(member.user_id);
        return memberId !== currentUserId;
      });

      if (otherMember && isPopulatedUser(otherMember.user_id)) {
        const user = otherMember.user_id;
        title = user.name || title;
        avatar = user.avatar || avatar;
      }
    }

    return {
      id: rawRoom._id.toString(),
      title,
      typeRoom,
      lastMessageId: rawRoom.last_message_id
        ? rawRoom.last_message_id.toString()
        : null,
      avatar,
      members: (rawRoom.members || []).map((member) => ({
        userId: getMemberUserId(member.user_id),
        role: member.role,
        status: member.status,
      })),
    };
  }

  public static toPersistence(room: RoomEntity) {
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
}
