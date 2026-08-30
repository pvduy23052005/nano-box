import { RoomType } from './chat.enum';
import { RoomMember } from './member.object';
import { RoomProps } from './room.type';
import { randomUUID } from 'node:crypto';


export class RoomEntity {
  private id: string;
  private title: string | null;
  private type_room: RoomType;
  private last_message_id: string | null;
  private avatar: string | null;
  private members: RoomMember[];

  private constructor(data: RoomProps) {
    this.id = data.id;
    this.title = data.title;
    this.type_room = data.typeRoom;
    this.last_message_id = data.lastMessageid;
    this.avatar = data.avatar;
    this.members = data.members;
  }

  public static createSingleRoom(myId: string, memberId: string): RoomEntity {
    const errors: Record<string, string> = {};

    if (!myId) {
      errors.myId = 'myId is required';
    }
    if (!memberId) {
      errors.memberId = 'memberId is required';
    }
    if (Object.keys(errors).length > 0) {
      throw new Error(JSON.stringify(errors));
    }

    const members: RoomMember[] = [
      RoomMember.createMember(myId),
      RoomMember.createWaitingMember(memberId),
    ];

    return new RoomEntity({
      id: randomUUID(),
      title: null,
      typeRoom: RoomType.SINGLE,
      lastMessageid: null,
      avatar: null,
      members: members,
    });
  }

  public static restore(data: RoomProps): RoomEntity {
    return new RoomEntity({
      id: data.id,
      title: data.title,
      typeRoom: data.typeRoom,
      lastMessageid: data.lastMessageid,
      avatar: data.avatar,
      members: data.members,
    });
  }

  public toObject(): RoomProps {
    return {
      id: this.id,
      title: this.title,
      typeRoom: this.type_room,
      lastMessageid: this.last_message_id,
      avatar: this.avatar,
      members: this.members,
    };
  }

  public getId(): string {
    return this.id;
  }
  public getTitle(): string | null {
    return this.title;
  }
  public getTypeRoom(): RoomType {
    return this.type_room;
  }
  public getLastMessageId(): string | null {
    return this.last_message_id;
  }
  public getAvatar(): string | null {
    return this.avatar;
  }
  public getMembers(): RoomMember[] {
    return this.members;
  }
}
