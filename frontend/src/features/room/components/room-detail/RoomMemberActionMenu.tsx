"use client";

import { useState } from "react";
import { MoreVertical, ShieldAlert, ShieldCheck, UserMinus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { RoomDetailMember } from "./types";
import { MemberRole } from "../../types/room.type";
import { useRemoveMember } from "../../hooks/useRemoveMember";
import { useAssignAdmin } from "../../hooks/useAssignAdmin";
import { useRevokeAdmin } from "../../hooks/useRevokeAdmin";
import ConfirmMemberActionDialog from "./ConfirmMemberActionDialog";

interface RoomMemberActionMenuProps {
  roomId: string;
  member: RoomDetailMember;
  myRole: MemberRole;
  isMe: boolean;
}

export default function RoomMemberActionMenu({
  roomId,
  member,
  myRole,
  isMe,
}: RoomMemberActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"kick" | "revoke" | null>(null);

  const { removeMember, isRemoving } = useRemoveMember();
  const { assignAdmin, isAssigning } = useAssignAdmin();
  const { revokeAdmin, isRevoking } = useRevokeAdmin();

  if (isMe) return null;

  const memberId = member.user?.id;
  if (!memberId) return null;

  const memberName = member.user?.name || "Thành viên";
  const memberAvatar = member.user?.avatar || undefined;
  const targetRole = member.role;

  const isSuperAdmin = myRole === MemberRole.SUPER_ADMIN;
  const isAdmin = myRole === MemberRole.ADMIN;

  const canAssignAdmin = isSuperAdmin && targetRole === MemberRole.MEMBER;
  const canRevokeAdmin = isSuperAdmin && targetRole === MemberRole.ADMIN;
  const canKick =
    (isSuperAdmin && targetRole !== MemberRole.SUPER_ADMIN) ||
    (isAdmin && targetRole === MemberRole.MEMBER);

  if (!canAssignAdmin && !canRevokeAdmin && !canKick) {
    return null;
  }

  const handleAssignAdmin = async () => {
    setIsOpen(false);
    await assignAdmin(roomId, memberId, memberName);
  };

  const handleConfirmKick = async () => {
    setDialogType(null);
    await removeMember(roomId, memberId, memberName);
  };

  const handleConfirmRevoke = async () => {
    setDialogType(null);
    await revokeAdmin(roomId, memberId, memberName);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          type="button"
          className="size-7 sm:size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Tùy chọn cho ${memberName}`}
        >
          <MoreVertical className="size-4" />
        </PopoverTrigger>

        <PopoverContent
          align="end"
          side="bottom"
          sideOffset={4}
          className="w-56 p-1.5 flex flex-col gap-0.5 shadow-lg border bg-popover text-popover-foreground"
        >
          {canAssignAdmin && (
            <button
              type="button"
              disabled={isAssigning}
              onClick={handleAssignAdmin}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs sm:text-sm font-medium text-foreground hover:bg-muted/80 rounded-lg transition-colors cursor-pointer disabled:opacity-50 text-left"
            >
              <ShieldCheck className="size-4 text-primary shrink-0" />
              <span className="truncate">Bổ nhiệm Quản trị viên</span>
            </button>
          )}

          {canRevokeAdmin && (
            <button
              type="button"
              disabled={isRevoking}
              onClick={() => {
                setIsOpen(false);
                setDialogType("revoke");
              }}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs sm:text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50 text-left"
            >
              <ShieldAlert className="size-4 text-destructive shrink-0" />
              <span className="truncate">Thu hồi quyền Quản trị viên</span>
            </button>
          )}

          {canKick && (
            <button
              type="button"
              disabled={isRemoving}
              onClick={() => {
                setIsOpen(false);
                setDialogType("kick");
              }}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs sm:text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50 text-left"
            >
              <UserMinus className="size-4 text-destructive shrink-0" />
              <span className="truncate">Xóa khỏi nhóm</span>
            </button>
          )}
        </PopoverContent>
      </Popover>

      {/* Confirmation Dialog for Revoking Admin */}
      <ConfirmMemberActionDialog
        open={dialogType === "revoke"}
        onOpenChange={(open) => !open && setDialogType(null)}
        title="Thu hồi quyền Quản trị viên"
        description={`Bạn có chắc chắn muốn thu hồi quyền Quản trị viên của "${memberName}"? Người này sẽ trở thành thành viên thông thường.`}
        confirmLabel="Thu hồi quyền"
        confirmVariant="destructive"
        memberName={memberName}
        memberAvatar={memberAvatar}
        loading={isRevoking}
        onConfirm={handleConfirmRevoke}
      />

      {/* Confirmation Dialog for Kicking Member */}
      <ConfirmMemberActionDialog
        open={dialogType === "kick"}
        onOpenChange={(open) => !open && setDialogType(null)}
        title="Xóa thành viên khỏi nhóm"
        description={`Bạn có chắc chắn muốn xóa "${memberName}" khỏi nhóm này? Họ sẽ không thể xem hoặc gửi tin nhắn trong nhóm nữa.`}
        confirmLabel="Xóa thành viên"
        confirmVariant="destructive"
        memberName={memberName}
        memberAvatar={memberAvatar}
        loading={isRemoving}
        onConfirm={handleConfirmKick}
      />
    </>
  );
}
