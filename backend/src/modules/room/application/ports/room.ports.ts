import { RoomEntity } from '../../domain/room.entity';
import { RoomProps } from '../../domain/room.type';
import { MemberStatus } from '../../domain/chat.enum';

export abstract class RoomRepositoryAdapter {
  abstract save(room: RoomEntity): Promise<RoomProps>;

  abstract findRoomsByUserIdAndStatus(
    userId: string,
    status: MemberStatus,
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
}
