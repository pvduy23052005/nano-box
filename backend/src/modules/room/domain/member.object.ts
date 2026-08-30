import { MemberRole, MemberStatus } from "./chat.enum";

export class RoomMember {
  private user_id: string;
  private role: MemberRole;
  private status: MemberStatus;

  private constructor(user_id: string, role: MemberRole, status: MemberStatus) {
    this.user_id = user_id;
    this.role = role;
    this.status = status;
  }

  public static createWaitingMember(userId: string): RoomMember {
    return new RoomMember(userId, MemberRole.MEMBER, MemberStatus.WAITING);
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
    this.role = newRole;
  }

  public changeStatus(newStatus: MemberStatus): void {
    this.status = newStatus;
  }
}
