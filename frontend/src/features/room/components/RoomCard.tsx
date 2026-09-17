"use client";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/src/components/ui/avatar";
import { Typography } from "@/src/components/ui/typography";
import { cn } from "@/src/lib/utils";
import DOMPurify from "isomorphic-dompurify";
import { ChatRoom } from "../stores/useRoomStore";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useReadReceiptStore } from "@/src/features/chat/stores/useReadReceiptStore";
import { formatMessageTime } from "@/src/utils/formatTime";

interface RoomCardProps {
  room: ChatRoom;
  isSelected?: boolean;
  onClick?: () => void;
}

const cleanHtmlText = (html: string) => {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })
    .replace(/&nbsp;/g, " ")
    .trim();
};

export default function RoomCard({
  room,
  isSelected = false,
  onClick,
}: RoomCardProps) {
  const displayName = room.title || "Cuộc trò chuyện";
  const initials = displayName.slice(0, 2).toUpperCase();
  const user = useAuthStore((state) => state.user);
  const myLastReadId = useReadReceiptStore(
    (state) => state.readByRoom[room.id]?.[user?.id ?? ""],
  );
  const myLastReadIdFromRoom = room.members?.find(
    (m) => m.userId === user?.id,
  )?.lastReadMessageId;
  const effectiveMyLastReadId = myLastReadId || myLastReadIdFromRoom;

  const lastMessage =
    typeof room.lastMessageId === "object" && room.lastMessageId !== null
      ? room.lastMessageId
      : null;

  const isMe =
    !!user?.id && !!lastMessage?.senderId && lastMessage.senderId === user.id;

  const isUnread =
    !isSelected &&
    !isMe &&
    !!lastMessage?.id &&
    (!effectiveMyLastReadId || lastMessage.id > effectiveMyLastReadId);

  const getPreviewText = () => {
    if (!room.lastMessageId) {
      return "Bắt đầu cuộc trò chuyện";
    }

    if (!lastMessage) {
      return "Tin nhắn mới nhất";
    }

    const rawContent = lastMessage.content
      ? cleanHtmlText(lastMessage.content)
      : "";
    const displayContent = rawContent || "Tin nhắn mới nhất";

    return isMe ? `Bạn: ${displayContent}` : displayContent;
  };

  const timeText = formatMessageTime(lastMessage?.createdAt);

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
          <Typography
            variant="small"
            className={cn(
              "truncate",
              isUnread ? "font-bold text-foreground" : "font-medium",
            )}
          >
            {displayName}
          </Typography>
          {timeText && (
            <span
              className={cn(
                "text-[11px] shrink-0",
                isUnread ? "font-medium text-primary" : "text-muted-foreground",
              )}
            >
              {timeText}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-1">
          <Typography
            variant="caption"
            className={cn(
              "truncate text-xs",
              isUnread
                ? "font-semibold text-foreground"
                : "text-muted-foreground",
            )}
          >
            {getPreviewText()}
          </Typography>
          {isUnread && (
            <span className="size-2 rounded-full bg-primary shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
}

export { RoomCard };
