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
    this.last_message_id = data.lastMessageId;
    this.avatar = data.avatar;
    this.members = data.members.map((member) =>
      member instanceof RoomMember
        ? member
        : RoomMember.restore(member.userId, member.role, member.status),
    );
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
      lastMessageId: null,
      avatar: null,
      members: members,
    });
  }

  public static restore(data: RoomProps): RoomEntity {
    return new RoomEntity({
      id: data.id,
      title: data.title,
      typeRoom: data.typeRoom,
      lastMessageId: data.lastMessageId,
      avatar: data.avatar,
      members: data.members,
    });
  }

  public toObject(): RoomProps {
    return {
      id: this.id,
      title: this.title,
      typeRoom: this.type_room,
      lastMessageId: this.last_message_id,
      avatar: this.avatar,
      members: this.members.map((member) => ({
        userId: member.userId,
        role: member.role,
        status: member.status,
      })),
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
  public getMembers(): readonly RoomMember[] {
    return Object.freeze([...this.members]);
  }
}
