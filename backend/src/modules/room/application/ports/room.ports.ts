import { RoomEntity } from '../../domain/room.entity';
import { RoomProps } from '../../domain/room.type';
import { MemberRole, MemberStatus } from '../../domain/chat.enum';

export interface RoomMemberSummary {
  userId: string;
  role: MemberRole;
  status: MemberStatus;
  name?: string | null;
  avatar?: string | null;
}

export interface RoomMembersResult {
  roomId: string;
  members: RoomMemberSummary[];
}

export abstract class RoomRepositoryAdapter {
  abstract save(room: RoomEntity): Promise<RoomProps>;

  abstract findRoomsByUserIdAndStatus(
    userId: string,
    status: MemberStatus,
    search?: string,
  ): Promise<RoomProps[]>;

  abstract checkRoomExist(
    myId: string,
    userId: string,
  ): Promise<RoomProps | null>;

  abstract findById(
    roomId: string,
    currentUserId?: string,
  ): Promise<RoomProps | null>;

  abstract updateLastMessageId(
    roomId: string,
    messageId: string,
  ): Promise<void>;

  abstract updateMemberLastReadMessage(
    roomId: string,
    userId: string,
    messageId: string,
  ): Promise<boolean>;

  abstract acceptAllMembers(roomId: string): Promise<RoomProps | null>;

  abstract deleteRoom(roomId: string): Promise<boolean>;

  abstract isMessageInRoom(roomId: string, messageId: string): Promise<boolean>;

  abstract isUserMember?(roomId: string, userId: string): Promise<boolean>;

  abstract findRoomMembers(roomId: string): Promise<RoomMembersResult | null>;

  abstract findRoomMembersWithProfile(
    roomId: string,
  ): Promise<RoomMembersResult | null>;

  abstract findRelatedUserIdsByRooms(
    userId: string,
    status: MemberStatus,
  ): Promise<string[]>;
}
