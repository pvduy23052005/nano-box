"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Typography } from "@/src/components/ui/typography";
import { useRoomStore } from "../../room/stores/useRoomStore";

export default function ChatHeader() {
  const { activeRoom } = useRoomStore();

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

  return (
    <header className="hidden sm:flex h-12 border-b items-center gap-2 p-2">
      <Avatar className="size-8">
        <AvatarImage src={activeRoom.avatar || ""} alt={displayName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <Typography variant="small" className="font-medium leading-none">
          {displayName}
        </Typography>

        <Typography
          variant="caption"
          className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground"
        >
          <span className="size-2 rounded-full bg-emerald-500" />
          Đang hoạt động
        </Typography>
      </div>
    </header>
  );
}
