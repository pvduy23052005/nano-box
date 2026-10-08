import { MemberRole, MemberStatus } from './chat.enum';

export class RoomMember {
  private readonly _userId: string;
  private _role: MemberRole;
  private _status: MemberStatus;
  private _lastReadMessageId?: string | null;

  private constructor(
    userId: string,
    role: MemberRole,
    status: MemberStatus,
    lastReadMessageId?: string | null,
  ) {
    this._userId = userId;
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

  public canBeRemovedBy(actor: RoomMember): {
    allowed: boolean;
    reason?: string;
  } {
    if (this._role === MemberRole.SUPER_ADMIN) {
      return {
        allowed: false,
        reason: 'Không thể xóa Trưởng nhóm khỏi phòng',
      };
    }

    if (actor.getRole() === MemberRole.ADMIN && this._role === MemberRole.ADMIN) {
      return {
        allowed: false,
        reason: 'Quản trị viên không thể xóa Quản trị viên khác',
      };
    }

    return { allowed: true };
  }

  public canBeAssignedAdminBy(actor: RoomMember): {
    allowed: boolean;
    reason?: string;
  } {
    if (actor.getRole() !== MemberRole.SUPER_ADMIN) {
      return {
        allowed: false,
        reason: 'Chỉ trưởng nhóm mới có quyền bổ nhiệm quản trị viên',
      };
    }

    if (this.isAdmin()) {
      return {
        allowed: false,
        reason: 'Thành viên này đã là quản trị viên hoặc trưởng nhóm',
      };
    }

    return { allowed: true };
  }

  public canBeRevokedAdminBy(actor: RoomMember): {
    allowed: boolean;
    reason?: string;
  } {
    if (actor.getRole() !== MemberRole.SUPER_ADMIN) {
      return {
        allowed: false,
        reason: 'Chỉ trưởng nhóm mới có quyền cắt chức quản trị viên',
      };
    }

    if (this._role === MemberRole.SUPER_ADMIN) {
      return {
        allowed: false,
        reason: 'Không thể cắt chức Trưởng nhóm',
      };
    }

    if (this._role !== MemberRole.ADMIN) {
      return {
        allowed: false,
        reason: 'Thành viên này không phải là quản trị viên',
      };
    }

    return { allowed: true };
  }

  public getUserId(): string {
    return this._userId;
  }

  public getRole(): MemberRole {
    return this._role;
  }

  public getStatus(): MemberStatus {
    return this._status;
  }

  public getLastReadMessageId(): string | null | undefined {
    return this._lastReadMessageId;
  }

  get userId(): string {
    return this.getUserId();
  }
  get role(): MemberRole {
    return this.getRole();
  }
  get status(): MemberStatus {
    return this.getStatus();
  }
  get lastReadMessageId(): string | null | undefined {
    return this.getLastReadMessageId();
  }
}
