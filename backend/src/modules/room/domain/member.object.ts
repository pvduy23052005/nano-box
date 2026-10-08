import { MemberRole, MemberStatus } from './chat.enum';

export class RoomMember {
  private readonly _user_id: string;
  private _role: MemberRole;
  private _status: MemberStatus;
  private _lastReadMessageId?: string | null;

  private constructor(
    userId: string,
    role: MemberRole,
    status: MemberStatus,
    lastReadMessageId?: string | null,
  ) {
    this._user_id = userId;
    this._role = role;
    this._status = status;
    if (lastReadMessageId !== undefined) {
      this._lastReadMessageId = lastReadMessageId;
    }
  }

  public static restore(
    userId: string,
    role: MemberRole,
    status: MemberStatus,
    lastReadMessageId?: string | null,
  ): RoomMember {
    return new RoomMember(userId, role, status, lastReadMessageId);
  }

  public static createWaitingMember(userId: string): RoomMember {
    return new RoomMember(userId, MemberRole.MEMBER, MemberStatus.WAITTING);
  }

  public static createMember(userId: string): RoomMember {
    return new RoomMember(userId, MemberRole.MEMBER, MemberStatus.ACCEPTED);
  }

  public static createSuperAdmin(userId: string): RoomMember {
    return new RoomMember(
      userId,
      MemberRole.SUPER_ADMIN,
      MemberStatus.ACCEPTED,
    );
  }

  public static createAdmin(userId: string): RoomMember {
    return new RoomMember(userId, MemberRole.ADMIN, MemberStatus.ACCEPTED);
  }

  public changeRole(newRole: MemberRole): void {
    this._role = newRole;
  }

  public changeStatus(newStatus: MemberStatus): void {
    this._status = newStatus;
  }

  public isAccepted(): boolean {
    return this._status === MemberStatus.ACCEPTED;
  }

  public isAdmin(): boolean {
    return (
      this._role === MemberRole.SUPER_ADMIN || this._role === MemberRole.ADMIN
    );
  }

  get userId(): string {
    return this._user_id;
  }
  get role(): MemberRole {
    return this._role;
  }
  get status(): MemberStatus {
    return this._status;
  }
  get lastReadMessageId(): string | null | undefined {
    return this._lastReadMessageId;
  }
}
