"use client";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/src/components/ui/avatar";
import { Typography } from "@/src/components/ui/typography";
import { cn } from "@/src/lib/utils";
import { ChatRoom } from "../stores/useRoomStore";

interface RoomCardProps {
  room: ChatRoom;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function RoomCard({
  room,
  isSelected = false,
  onClick,
}: RoomCardProps) {
  const displayName = room.title || "Cuộc trò chuyện";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg cursor-pointer p-2 transition-colors",
        isSelected
          ? "bg-accent text-accent-foreground font-medium"
          : "hover:bg-muted/60",
      )}
    >
      <Avatar className="size-10 shrink-0">
        <AvatarImage src={room.avatar || ""} alt={displayName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <Typography variant="small" className="truncate font-medium">
            {displayName}
          </Typography>
        </div>
        <Typography
          variant="caption"
          className="truncate text-muted-foreground text-xs"
        >
          {room.lastMessageId ? "Tin nhắn mới nhất" : "Bắt đầu cuộc trò chuyện"}
        </Typography>
      </div>
    </div>
  );
}

export { RoomCard };
