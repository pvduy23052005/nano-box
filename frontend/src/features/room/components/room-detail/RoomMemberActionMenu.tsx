"use client";

import { useState } from "react";
import { MoreVertical, ShieldAlert, ShieldCheck, UserMinus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
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

  const handleOpenRevokeDialog = () => {
    setIsOpen(false);
    setDialogType("revoke");
  };

  const handleOpenKickDialog = () => {
    setIsOpen(false);
    setDialogType("kick");
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setDialogType(null);
    }
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
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="sm:size-8 text-muted-foreground hover:text-foreground"
              aria-label={`Tùy chọn cho ${memberName}`}
            />
          }
        >
          <MoreVertical />
        </PopoverTrigger>

        <PopoverContent
          align="end"
          side="bottom"
          sideOffset={4}
          className="w-56 p-1.5 flex flex-col gap-0.5 shadow-lg"
        >
          {canAssignAdmin && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isAssigning}
              onClick={handleAssignAdmin}
              className="w-full justify-start h-8 sm:h-9 px-2.5 text-xs sm:text-sm font-medium text-foreground"
            >
              <ShieldCheck
                data-icon="inline-start"
                className="text-primary shrink-0"
              />
              <span className="truncate">Bổ nhiệm Quản trị viên</span>
            </Button>
          )}

          {canRevokeAdmin && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isRevoking}
              onClick={handleOpenRevokeDialog}
              className="w-full justify-start h-8 sm:h-9 px-2.5 text-xs sm:text-sm font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <ShieldAlert data-icon="inline-start" className="shrink-0" />
              <span className="truncate">Thu hồi quyền Quản trị viên</span>
            </Button>
          )}

          {canKick && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isRemoving}
              onClick={handleOpenKickDialog}
              className="w-full justify-start h-8 sm:h-9 px-2.5 text-xs sm:text-sm font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <UserMinus data-icon="inline-start" className="shrink-0" />
              <span className="truncate">Xóa khỏi nhóm</span>
            </Button>
          )}
        </PopoverContent>
      </Popover>

      <ConfirmMemberActionDialog
        open={dialogType === "revoke"}
        onOpenChange={handleDialogOpenChange}
        title="Thu hồi quyền Quản trị viên"
        description={`Bạn có chắc chắn muốn thu hồi quyền Quản trị viên của "${memberName}"? Người này sẽ trở thành thành viên thông thường.`}
        confirmLabel="Thu hồi quyền"
        confirmVariant="destructive"
        memberName={memberName}
        memberAvatar={memberAvatar}
        loading={isRevoking}
        onConfirm={handleConfirmRevoke}
      />

      <ConfirmMemberActionDialog
        open={dialogType === "kick"}
        onOpenChange={handleDialogOpenChange}
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
