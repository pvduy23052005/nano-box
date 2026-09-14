"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";
import { Typography } from "@/src/components/ui/typography";
import { cn } from "@/src/lib/utils";
import { ChatRoom } from "../stores/useRoomStore";
import { useAuthStore } from "../../auth/store/useAuthStore";

interface RoomCardProps {
  room: ChatRoom;
  isSelected?: boolean;
  onClick?: () => void;
}

const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>?/gm, "").trim();
};

export default function RoomCard({
  room,
  isSelected = false,
  onClick,
}: RoomCardProps) {
  const displayName = room.title || "Cuộc trò chuyện";
  const initials = displayName.slice(0, 2).toUpperCase();
  const user = useAuthStore((state) => state.user);

  const lastMessage =
    typeof room.lastMessageId === "object" && room.lastMessageId !== null
      ? room.lastMessageId
      : null;

  const isMe =
    !!user?.id && !!lastMessage?.senderId && lastMessage.senderId === user.id;

  const getPreviewText = () => {
    if (!room.lastMessageId) {
      return "Bắt đầu cuộc trò chuyện";
    }

    if (!lastMessage) {
      return "Tin nhắn mới nhất";
    }

    const rawContent = lastMessage.content ? stripHtml(lastMessage.content) : "";
    const displayContent = rawContent || "Tin nhắn mới nhất";

    return isMe ? `Bạn: ${displayContent}` : displayContent;
  };

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
          {getPreviewText()}
        </Typography>
      </div>
    </div>
  );
}

export { RoomCard };
