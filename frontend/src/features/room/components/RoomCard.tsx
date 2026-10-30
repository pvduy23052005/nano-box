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
import { usePresenceStore } from "@/src/features/user/stores/usePresenceStore";
import { formatMessageTime } from "@/src/utils/formatTime";

import { RoomType } from "../types/room.type";
import { GroupAvatar } from "./GroupAvatar";

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

  const otherMemberId =
    room.typeRoom !== RoomType.GROUP
      ? room.members?.find((member) => member.userId !== user?.id)?.userId
      : undefined;
  const isOtherUserOnline = usePresenceStore((state) =>
    otherMemberId ? !!state.onlineUsers[otherMemberId] : false,
  );

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

  const isMentioned =
    !isMe &&
    !!user?.id &&
    Boolean(lastMessage?.mentionedUserIds?.includes(user.id));

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
        "relative flex items-center bg-card justify-start gap-3 cursor-pointer p-2.5 sm:p-2.5 transition-all duration-150 w-full active:scale-[0.99] active:bg-accent/40 select-none",
        isSelected
          ? "bg-accent/40 text-foreground border-l-4 border-primary"
          : "hover:bg-accent/20 text-foreground",
      )}
    >
      <div className="relative shrink-0">
        {room.typeRoom === RoomType.GROUP ? (
          <GroupAvatar
            avatars={room.groupAvatars}
            singleAvatar={room.avatar}
            title={displayName}
            size="md"
          />
        ) : (
          <>
            <Avatar className="size-11 rounded-full after:hidden">
              <AvatarImage
                src={room.avatar || ""}
                alt={displayName}
                className="rounded-full object-cover"
              />
              <AvatarFallback className="rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isOtherUserOnline && (
              <span
                title="Đang hoạt động"
                className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-card z-10"
              />
            )}
          </>
        )}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <Typography
            variant="small"
            className={cn("truncate font-semibold text-[13px] text-foreground")}
          >
            {displayName}
          </Typography>
          {timeText && (
            <span className="text-[11px] shrink-0 text-muted-foreground/80 font-normal">
              {timeText}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-1 mt-0.5">
          <Typography
            variant="caption"
            className={cn(
              "truncate text-xs",
              isUnread
                ? "font-medium text-foreground"
                : "text-muted-foreground",
            )}
          >
            {isUnread && isMentioned && (
              <span className="text-primary font-semibold mr-1">[@Bạn]</span>
            )}
            {getPreviewText()}
          </Typography>
          {isUnread && (
            <span
              className={cn(
                "rounded-full shrink-0 flex items-center justify-center",
                isMentioned
                  ? "bg-primary text-primary-foreground text-[10px] size-4 font-bold"
                  : "size-2 bg-primary",
              )}
            >
              {isMentioned ? "@" : null}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export { RoomCard };
