import { Types } from 'mongoose';
import { RoomEntity } from '../domain/room.entity';
import { LastMessageProps, RoomProps } from '../domain/room.type';
import { RoomType, MemberRole, MemberStatus } from '../domain/chat.enum';
import { LastMessageOutput, RoomOutput } from '../presentation/dto/room.output';

export interface PopulatedUser {
  _id: Types.ObjectId;
  name?: string;
  avatar?: string | null;
}

export interface MemberItem {
  user_id: PopulatedUser;
  role: MemberRole;
  status: MemberStatus;
  last_read_message_id?: Types.ObjectId | string | null;
  joined_at?: Date;
}

export interface PopulatedMessage {
  _id: Types.ObjectId | string;
  content?: string | null;
  created_at?: Date | null;
  sender_id?: string | null;
  senderId?: string | null;
}

export interface RawRoomInput {
  _id: Types.ObjectId | string;
  title: string | null;
  type_room: RoomType;
  last_message_id: Types.ObjectId | PopulatedMessage | string | null;
  avatar: string | null;
  members: MemberItem[];
}

const getMemberUserId = (
  userId: Types.ObjectId | PopulatedUser | string,
): string => {
  if (!userId) return '';
  if (typeof userId === 'string') return userId;
  if (userId instanceof Types.ObjectId) return userId.toString();
  if (typeof userId === 'object' && '_id' in userId && userId._id) {
    return userId._id.toString();
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

    let lastMessageId: RoomProps['lastMessageId'] = null;

    if (rawRoom.last_message_id) {
      if (typeof rawRoom.last_message_id === 'string') {
        lastMessageId = rawRoom.last_message_id;
      } else if (rawRoom.last_message_id instanceof Types.ObjectId) {
        lastMessageId = rawRoom.last_message_id.toString();
      } else if (
        typeof rawRoom.last_message_id === 'object' &&
        '_id' in rawRoom.last_message_id
      ) {
        const message = rawRoom.last_message_id;
        lastMessageId = {
          id: message._id.toString(),
          content: message.content ?? null,
          createdAt: message.created_at ? new Date(message.created_at) : null,
          senderId: message.sender_id ?? message.senderId ?? null,
        };
      }
    }

    return {
      id: rawRoom._id.toString(),
      title,
      typeRoom,
      lastMessageId,
      avatar,
      members: (rawRoom.members || []).map((member) => ({
        userId: getMemberUserId(member.user_id),
        role: member.role,
        status: member.status,
        lastReadMessageId: member.last_read_message_id
          ? member.last_read_message_id.toString()
          : null,
      })),
    };
  }

  public static toPersistence(room: RoomEntity) {
    const roomData = room.toObject();
    const lastMessageId =
      typeof roomData.lastMessageId === 'object' &&
      roomData.lastMessageId !== null
        ? roomData.lastMessageId.id
        : roomData.lastMessageId;

    return {
      title: roomData.title,
      type_room: roomData.typeRoom,
      last_message_id: lastMessageId,
      avatar: roomData.avatar,
      members: roomData.members.map((member) => ({
        user_id: member.userId,
        role: member.role,
        status: member.status,
      })),
    };
  }

  public static formatLastMessage(
    lastMessageId: string | null | LastMessageProps | undefined,
  ): LastMessageOutput | null {
    if (!lastMessageId) return null;
    if (typeof lastMessageId === 'object') {
      return {
        id: lastMessageId.id,
        content: lastMessageId.content,
        createdAt: lastMessageId.createdAt,
        senderId: lastMessageId.senderId,
      };
    }
    return {
      id: lastMessageId,
      content: null,
      createdAt: null,
      senderId: null,
    };
  }

  public static toOutput(
    room: RoomProps,
    overrides?: { title?: string | null; avatar?: string | null },
  ): RoomOutput {
    return {
      id: room.id,
      title: overrides?.title !== undefined ? overrides.title : room.title,
      typeRoom: room.typeRoom,
      lastMessageId: RoomMapper.formatLastMessage(room.lastMessageId),
      members: room.members.map((member) => ({
        userId: member.userId,
        role: member.role,
        status: member.status,
        lastReadMessageId: member.lastReadMessageId ?? null,
      })),
      avatar: overrides?.avatar !== undefined ? overrides.avatar : room.avatar,
    };
  }
}
