"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { MessageAvatar } from "@/src/components/ui/message";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/src/components/ui/tooltip";

export interface ChatMessageAvatarProps {
  avatar?: string | null;
  senderName?: string | null;
}

export function ChatMessageAvatar({
  avatar,
  senderName,
}: ChatMessageAvatarProps) {
  const initials = senderName
    ? senderName.trim().slice(0, 2).toUpperCase()
    : "U";

  return (
    <MessageAvatar>
      <Tooltip>
        <TooltipTrigger
          render={
            <span className="inline-flex cursor-pointer rounded-full transition-transform hover:scale-105 active:scale-95" />
          }
        >
          <Avatar className="size-8 rounded-full after:hidden">
            {avatar ? (
              <AvatarImage
                src={avatar}
                alt={senderName ?? "Avatar"}
                className="object-cover size-full rounded-full"
              />
            ) : null}
            <AvatarFallback className="bg-emerald-50 text-emerald-700 text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent side="right" align="center" sideOffset={6}>
          {senderName || "Người dùng"}
        </TooltipContent>
      </Tooltip>
    </MessageAvatar>
  );
}
