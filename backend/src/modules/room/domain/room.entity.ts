import { MemberRole, MemberStatus, RoomType } from './chat.enum';
import { RoomMember } from './member.object';
import { LastMessageProps, RoomMemberProps, RoomProps } from './room.type';
import { DomainValidationException } from 'src/common/customs/domain-validation.exception';

interface CreateRoomEntityData {
  id?: string;
  title: string | null;
  typeRoom: RoomType;
  lastMessageId: string | null | LastMessageProps;
  avatar: string | null;
  members: (RoomMember | RoomMemberProps)[];
}

export class RoomEntity {
  private id?: string;
  private title: string | null;
  private typeRoom: RoomType;
  private lastMessageId: string | null | LastMessageProps;
  private avatar: string | null;
  private members: RoomMember[];

  private constructor(data: CreateRoomEntityData) {
    this.id = data.id;
    this.title = data.title;
    this.typeRoom = data.typeRoom;
    this.lastMessageId = data.lastMessageId;
    this.avatar = data.avatar;
    this.members = data.members.map((member) =>
      member instanceof RoomMember
        ? member
        : RoomMember.restore(
            member.userId,
            member.role,
            member.status,
            member.lastReadMessageId,
          ),
    );
  }

  public static createSingleRoom(myId: string, memberId: string): RoomEntity {
    const errors: Record<string, string> = {};

    if (!myId) {
      errors.myId = 'ID người dùng hiện tại là bắt buộc';
    }
    if (!memberId) {
      errors.memberId = 'ID thành viên là bắt buộc';
    }
    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }

    const members: RoomMember[] = [
      RoomMember.createMember(myId),
      RoomMember.createWaitingMember(memberId),
    ];

    return new RoomEntity({
      title: null,
      typeRoom: RoomType.SINGLE,
      lastMessageId: null,
      avatar: null,
      members: members,
    });
  }

  public static createFriendRoom(user1Id: string, user2Id: string): RoomEntity {
    const errors: Record<string, string> = {};

    if (!user1Id) {
      errors.user1Id = 'ID người dùng thứ nhất là bắt buộc';
    }
    if (!user2Id) {
      errors.user2Id = 'ID người dùng thứ hai là bắt buộc';
    }
    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }

    const members: RoomMember[] = [
      RoomMember.createMember(user1Id),
      RoomMember.createMember(user2Id),
    ];

    return new RoomEntity({
      title: null,
      typeRoom: RoomType.SINGLE,
      lastMessageId: null,
      avatar: null,
      members: members,
    });
  }

  public static createGroupRoom(
    creatorId: string,
    title: string,
    memberIds: string[],
    avatar: string | null = null,
  ): RoomEntity {
    const cleanTitle = title?.trim();
    const uniqueMemberIds = Array.from(
      new Set((memberIds || []).filter((id) => id && id !== creatorId)),
    );

    const errors: Record<string, string> = {};
    if (!creatorId) {
      errors.creatorId = 'Người tạo phòng là bắt buộc';
    }
    if (!cleanTitle) {
      errors.title = 'Tên phòng nhóm không được để trống';
    }
    if (uniqueMemberIds.length < 2) {
      errors.memberIds =
        'Phòng nhóm phải có ít nhất 2 thành viên khác ngoài bạn';
    }
    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }

    const members: RoomMember[] = [
      RoomMember.createSuperAdmin(creatorId),
      ...uniqueMemberIds.map((id) => RoomMember.createMember(id)),
    ];

    return new RoomEntity({
      title: cleanTitle,
      typeRoom: RoomType.GROUP,
      lastMessageId: null,
      avatar,
      members,
    });
  }

  public getMember(userId: string): RoomMember | undefined {
    return this.members.find((member) => member.getUserId() === userId);
  }

  public isMember(userId: string): boolean {
    const member = this.getMember(userId);
    return member ? member.isAccepted() : false;
  }

  public isAdmin(userId: string): boolean {
    const member = this.getMember(userId);
    return member ? member.isAccepted() && member.isAdmin() : false;
  }

  public updateGroupProfile(
    updaterId: string,
    title?: string | null,
    avatar?: string | null,
  ): void {
    const errors: Record<string, string> = {};

    if (this.typeRoom !== RoomType.GROUP) {
      errors.typeRoom = 'Chỉ có thể cập nhật thông tin của phòng nhóm';
    }

    if (!this.isMember(updaterId)) {
      errors.member = 'Bạn không phải là thành viên của phòng này';
    } else if (!this.isAdmin(updaterId)) {
      errors.role = 'Chỉ quản trị viên mới có quyền cập nhật thông tin phòng';
    }

    if (title === undefined && avatar === undefined) {
      errors.update =
        'Phải cung cấp ít nhất tiêu đề hoặc ảnh đại diện để cập nhật';
    }

    let cleanTitle: string | undefined;
    if (title !== undefined) {
      cleanTitle = title?.trim();
      if (!cleanTitle) {
        errors.title = 'Tên phòng nhóm không được để trống';
      } else if (cleanTitle.length > 100) {
        errors.title = 'Tên phòng nhóm không được vượt quá 100 ký tự';
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }

    if (cleanTitle !== undefined) {
      this.title = cleanTitle;
    }

    if (avatar !== undefined) {
      this.avatar = avatar ? avatar.trim() : null;
    }
  }

  public addMember(adderId: string, userId: string): void {
    const errors: Record<string, string> = {};

    if (this.typeRoom !== RoomType.GROUP) {
      errors.typeRoom = 'Chỉ có thể thêm thành viên vào phòng nhóm';
    }

    if (!this.isMember(adderId)) {
      errors.member = 'Bạn không phải là thành viên của phòng này';
    } else if (!this.isAdmin(adderId)) {
      errors.role = 'Chỉ quản trị viên mới có quyền thêm thành viên vào nhóm';
    }

    const cleanUserId = userId?.trim().toString();
    if (!cleanUserId) {
      errors.userId = 'ID người dùng không được để trống';
    }

    if (adderId && cleanUserId && adderId === cleanUserId) {
      errors.userId = 'Bạn đã ở trong nhóm';
    }

    const existingMember = cleanUserId
      ? this.getMember(cleanUserId)
      : undefined;
    if (existingMember && existingMember.isAccepted()) {
      errors.userId = 'Người dùng đã là thành viên trong nhóm';
    }

    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }

    if (!existingMember) {
      this.members.push(RoomMember.createMember(cleanUserId));
      return;
    }

    existingMember.changeStatus(MemberStatus.ACCEPTED);
    existingMember.changeRole(MemberRole.MEMBER);
  }

  public removeMember(actorId: string, targetUserId: string): void {
    const errors: Record<string, string> = {};

    if (this.typeRoom !== RoomType.GROUP) {
      errors.typeRoom = 'Chỉ có thể xóa thành viên khỏi phòng nhóm';
    }

    if (!this.isMember(actorId)) {
      errors.member = 'Bạn không phải là thành viên của phòng này';
    } else if (!this.isAdmin(actorId)) {
      errors.role = 'Chỉ quản trị viên mới có quyền xóa thành viên';
    }

    const cleanTargetUserId = targetUserId?.trim().toString();
    if (!cleanTargetUserId) {
      errors.userId = 'ID thành viên cần xóa không được để trống';
    } else if (actorId && actorId === cleanTargetUserId) {
      errors.userId =
        'Không thể tự xóa chính mình khỏi nhóm, hãy sử dụng chức năng rời nhóm';
    }

    const removedMember = cleanTargetUserId
      ? this.getMember(cleanTargetUserId)
      : undefined;

    if (cleanTargetUserId && (!removedMember || !removedMember.isAccepted())) {
      if (!errors.userId) {
        errors.userId = 'Thành viên này không tồn tại trong phòng';
      }
    }

    const actorMember = this.getMember(actorId);

    if (actorMember && removedMember && !errors.role) {
      const permission = removedMember.canBeRemovedBy(actorMember);
      if (!permission.allowed && permission.reason) {
        errors.role = permission.reason;
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }

    this.members = this.members.filter(
      (member) => member.getUserId() !== cleanTargetUserId,
    );
  }

  public leaveRoom(userId: string): {
    newSuperAdminId?: string;
    isRoomEmpty: boolean;
  } {
    const errors: Record<string, string> = {};

    if (this.typeRoom !== RoomType.GROUP) {
      errors.typeRoom = 'Chỉ có thể rời khỏi phòng nhóm';
    }

    const cleanUserId = userId?.trim().toString();
    if (!cleanUserId) {
      errors.userId = 'ID thành viên không được để trống';
    } else if (!this.isMember(cleanUserId)) {
      errors.member = 'Bạn không phải là thành viên của phòng này';
    }

    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }

    const leavingMember = this.getMember(cleanUserId);
    const isLeavingSuperAdmin =
      leavingMember?.getRole() === MemberRole.SUPER_ADMIN;

    this.members = this.members.filter(
      (member) => member.getUserId() !== cleanUserId,
    );

    let newSuperAdminId: string | undefined;

    if (isLeavingSuperAdmin && this.members.length > 0) {
      const candidateAdmin = this.members.find(
        (member) =>
          member.getRole() === MemberRole.ADMIN && member.isAccepted(),
      );
      const successor =
        candidateAdmin ||
        this.members.find((member) => member.isAccepted()) ||
        this.members[0];

      if (successor) {
        successor.changeRole(MemberRole.SUPER_ADMIN);
        newSuperAdminId = successor.getUserId();
      }
    }

    return {
      newSuperAdminId,
      isRoomEmpty: this.members.length === 0,
    };
  }

  public assignAdmin(actorId: string, targetUserId: string): void {
    const errors: Record<string, string> = {};

    if (this.typeRoom !== RoomType.GROUP) {
      errors.typeRoom = 'Chỉ có thể bổ nhiệm quản trị viên trong phòng nhóm';
    }

    if (!this.isMember(actorId)) {
      errors.member = 'Bạn không phải là thành viên của phòng này';
    }

    const cleanTargetUserId = targetUserId?.trim().toString();
    if (!cleanTargetUserId) {
      errors.userId = 'ID thành viên cần bổ nhiệm không được để trống';
    }

    const targetMember = cleanTargetUserId
      ? this.getMember(cleanTargetUserId)
      : undefined;

    if (cleanTargetUserId && (!targetMember || !targetMember.isAccepted())) {
      if (!errors.userId) {
        errors.userId = 'Thành viên này không tồn tại trong phòng';
      }
    }

    const actorMember = this.getMember(actorId);

    if (actorMember && targetMember) {
      const permission = targetMember.canBeAssignedAdminBy(actorMember);
      if (!permission.allowed && permission.reason) {
        errors.role = permission.reason;
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }

    targetMember?.changeRole(MemberRole.ADMIN);
  }

  public revokeAdmin(actorId: string, targetUserId: string): void {
    const errors: Record<string, string> = {};

    if (this.typeRoom !== RoomType.GROUP) {
      errors.typeRoom = 'Chỉ có thể cắt chức quản trị viên trong phòng nhóm';
    }

    if (!this.isMember(actorId)) {
      errors.member = 'Bạn không phải là thành viên của phòng này';
    }

    const cleanTargetUserId = targetUserId?.trim().toString();
    if (!cleanTargetUserId) {
      errors.userId = 'ID thành viên cần cắt chức không được để trống';
    }

    const targetMember = cleanTargetUserId
      ? this.getMember(cleanTargetUserId)
      : undefined;

    if (cleanTargetUserId && (!targetMember || !targetMember.isAccepted())) {
      if (!errors.userId) {
        errors.userId = 'Thành viên này không tồn tại trong phòng';
      }
    }

    const actorMember = this.getMember(actorId);

    if (actorMember && targetMember) {
      const permission = targetMember.canBeRevokedAdminBy(actorMember);
      if (!permission.allowed && permission.reason) {
        errors.role = permission.reason;
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new DomainValidationException(errors);
    }

    targetMember?.changeRole(MemberRole.MEMBER);
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
      id: this.id ?? '',
      title: this.title,
      typeRoom: this.typeRoom,
      lastMessageId: this.lastMessageId,
      avatar: this.avatar,
      members: this.members.map((member): RoomMemberProps => {
        const item: RoomMemberProps = {
          userId: member.getUserId(),
          role: member.getRole(),
          status: member.getStatus(),
        };
        const lastRead = member.getLastReadMessageId();
        if (lastRead !== undefined) {
          item.lastReadMessageId = lastRead;
        }
        return item;
      }),
    };
  }

  public getId(): string | undefined {
    return this.id;
  }
  public getTitle(): string | null {
    return this.title;
  }
  public getTypeRoom(): RoomType {
    return this.typeRoom;
  }
  public getLastMessageId(): LastMessageProps | null | string {
    return this.lastMessageId;
  }
  public getAvatar(): string | null {
    return this.avatar;
  }
  public getMembers(): readonly RoomMember[] {
    return Object.freeze([...this.members]);
  }
}
