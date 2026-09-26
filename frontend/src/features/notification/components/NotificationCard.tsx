"use client";

import { NotificationItem as NotificationItemType } from "../types/notification.types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { formatNotificationTime } from "@/src/utils/formatTime";
import { cn } from "@/src/lib/utils";
import DOMPurify from "isomorphic-dompurify";

interface NotificationCardProps {
  notification: NotificationItemType;
  onClick?: () => void;
}

const cleanHtml = (html?: string | null): string => {
  if (!html) return "";
  try {
    const sanitized = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
    return (sanitized || "").replace(/&nbsp;/g, " ").trim();
  } catch {
    return html
      .replace(/<[^>]*>?/gm, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
};

export default function NotificationCard({
  notification,
  onClick,
}: NotificationCardProps) {
  const displayName =
    notification.senderName || notification.title || "Thông báo";

  const senderInitial = displayName.trim().slice(0, 2).toUpperCase();
  const previewContent = cleanHtml(notification.content);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex items-start gap-3 p-2 hover:bg-accent/70 cursor-pointer",
        !notification.isRead &&
          "bg-primary/5 border-primary/25 hover:bg-primary/10",
      )}
    >
      <div className="">
        <Avatar className="size-12 rounded-full after:border-none">
          {notification.senderAvatar ? (
            <AvatarImage
              src={notification.senderAvatar}
              alt={displayName}
              className="rounded-full object-cover"
            />
          ) : null}
          <AvatarFallback className="rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {senderInitial}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span
            className={cn(
              "text-xs truncate leading-snug",
              !notification.isRead
                ? "font-semibold text-foreground"
                : "font-medium text-foreground/80",
            )}
          >
            {displayName}
          </span>
          <span className="text-[11px] text-muted-foreground shrink-0 font-normal">
            {formatNotificationTime(notification.createdAt)}
          </span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 break-words leading-relaxed">
          {previewContent ?? "Đã gửi một thông báo mới"}
        </p>
      </div>

      {!notification.isRead && (
        <span className="absolute right-3 top-1/2 size-3 rounded-full bg-primary ring-2 ring-background" />
      )}
    </div>
  );
}
