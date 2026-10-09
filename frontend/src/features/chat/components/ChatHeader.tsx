"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, MoreVertical } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Typography } from "@/src/components/ui/typography";
import { cn } from "@/src/lib/utils";
import { useRoomStore } from "../../room/stores/useRoomStore";
import { RoomType } from "../../room/types/room.type";
import { GroupAvatar } from "../../room/components/GroupAvatar";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { usePresenceStore } from "@/src/features/user/stores/usePresenceStore";

export default function ChatHeader() {
  const router = useRouter();
  const { activeRoom, setActiveRoom } = useRoomStore();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const onlineUsers = usePresenceStore((state) => state.onlineUsers);

  if (!activeRoom) {
    return (
      <header className="hidden sm:flex h-12 border-b items-center gap-2 p-2 px-4">
        <Typography variant="small" className="text-muted-foreground text-xs">
          Chọn một cuộc trò chuyện để bắt đầu
        </Typography>
      </header>
    );
  }

  const displayName = activeRoom.title || "Cuộc trò chuyện";
  const initials = displayName.slice(0, 2).toUpperCase();
  const isGroup = activeRoom.typeRoom === RoomType.GROUP;

  const otherMemberId = activeRoom.members?.find(
    (member) => member.userId !== currentUserId,
  )?.userId;
  const isOtherOnline = otherMemberId ? !!onlineUsers[otherMemberId] : false;

  const onlineMembersCount = isGroup
    ? (activeRoom.members?.filter((member) => !!onlineUsers[member.userId]).length ?? 0)
    : 0;

  const handleOpenRoomDetail = () => {
    if (activeRoom.id) {
      router.push(`/room/${activeRoom.id}`);
    }
  };

  return (
    <header className="flex h-12 border-b items-center justify-between gap-2 p-2 px-3 sm:px-4 shadow-sm bg-card">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => setActiveRoom(null)}
          className="sm:hidden size-8 -ml-1 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
          title="Quay lại danh sách phòng"
          aria-label="Quay lại"
        >
          <ArrowLeft className="size-4" />
        </Button>
        {isGroup ? (
          <GroupAvatar
            avatars={activeRoom.groupAvatars}
            singleAvatar={activeRoom.avatar}
            title={displayName}
            size="sm"
          />
        ) : (
          <Avatar className="size-8">
            <AvatarImage src={activeRoom.avatar || ""} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col min-w-0">
          <Typography variant="small" className="font-medium leading-none truncate">
            {displayName}
          </Typography>

          <Typography
            variant="caption"
            className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground"
          >
            {isGroup ? (
              <>
                <span
                  className={cn(
                    "size-2 rounded-full shrink-0",
                    onlineMembersCount > 0
                      ? "bg-emerald-500"
                      : "bg-muted-foreground/40",
                  )}
                />
                {onlineMembersCount > 0
                  ? `${onlineMembersCount} thành viên trực tuyến`
                  : "Tất cả ngoại tuyến"}
              </>
            ) : (
              <>
                <span
                  className={cn(
                    "size-2 rounded-full shrink-0",
                    isOtherOnline ? "bg-emerald-500" : "bg-muted-foreground/40",
                  )}
                />
                {isOtherOnline ? "Đang hoạt động" : "Ngoại tuyến"}
              </>
            )}
          </Typography>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpenRoomDetail}
        className="size-8 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
        title="Thông tin cuộc trò chuyện"
        aria-label="Thông tin cuộc trò chuyện"
      >
        <MoreVertical className="size-4" />
      </Button>
    </header>
  );
}
