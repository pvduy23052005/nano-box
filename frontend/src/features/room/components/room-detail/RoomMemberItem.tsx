"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { RoomDetailMember } from "./types";
import { MemberRole } from "../../types/room.type";
import RoomMemberActionMenu from "./RoomMemberActionMenu";

interface RoomMemberItemProps {
  member: RoomDetailMember;
  isMe: boolean;
  isOnline: boolean;
  roomId?: string;
  myRole?: MemberRole;
}

const getAvatarBg = (name: string) => {
  const colors = [
    "bg-primary/15 text-primary",
    "bg-secondary text-secondary-foreground",
    "bg-accent text-accent-foreground",
    "bg-muted text-muted-foreground",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function RoomMemberItem({
  member,
  isMe,
  isOnline,
  roomId,
  myRole,
}: RoomMemberItemProps) {
  const memberUser = member.user;
  const memberName = memberUser?.name || "Người dùng";
  const memberInitials = memberName.slice(0, 2).toUpperCase();

  const renderRoleBadge = (role: string) => {
    switch (role) {
      case MemberRole.SUPER_ADMIN:
        return (
          <Badge
            variant="default"
            className="text-[11px] sm:text-xs shrink-0 whitespace-nowrap transition-all duration-200"
          >
            <span className="sm:hidden">Admin</span>
            <span className="hidden sm:inline">Trưởng nhóm</span>
          </Badge>
        );
      case MemberRole.ADMIN:
        return (
          <Badge
            variant="secondary"
            className="text-[11px] sm:text-xs shrink-0 whitespace-nowrap transition-all duration-200"
          >
            <span className="sm:hidden">Mod</span>
            <span className="hidden sm:inline">Quản trị viên</span>
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="text-[11px] sm:text-xs text-muted-foreground shrink-0 whitespace-nowrap transition-all duration-200"
          >
            Thành viên
          </Badge>
        );
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 px-2.5 sm:px-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-all duration-200 animate-in fade-in slide-in-from-top-1 w-full min-w-0">
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
        <div className="relative shrink-0">
          <Avatar className="size-9 sm:size-10">
            <AvatarImage src={memberUser?.avatar ?? ""} alt={memberName} />
            <AvatarFallback
              className={cn(
                "text-xs sm:text-sm font-bold tracking-tight",
                getAvatarBg(memberName),
              )}
            >
              {memberInitials}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-card",
              isOnline ? "bg-primary" : "bg-muted-foreground/30",
            )}
            title={isOnline ? "Đang trực tuyến" : "Ngoại tuyến"}
          />
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-xs sm:text-sm text-foreground truncate">
              {memberName}
            </span>
            {isMe && (
              <span className="text-[11px] font-normal text-muted-foreground shrink-0">
                (Bạn)
              </span>
            )}
          </div>
          <span className="text-[11px] sm:text-xs text-muted-foreground truncate">
            {isOnline ? "Đang hoạt động" : "Offline"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {renderRoleBadge(member.role)}

        {roomId && myRole && (
          <RoomMemberActionMenu
            roomId={roomId}
            member={member}
            myRole={myRole}
            isMe={isMe}
          />
        )}
      </div>
    </div>
  );
}
