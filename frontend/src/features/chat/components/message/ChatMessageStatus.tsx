"use client";

import { CheckCheck } from "lucide-react";

export interface ChatMessageStatusProps {
  isSending?: boolean;
  isSeen?: boolean;
}

export function ChatMessageStatus({
  isSending,
  isSeen,
}: ChatMessageStatusProps) {
  const getStatusText = () => {
    if (isSending) return "Đang gửi...";
    if (isSeen) return "Đã xem";
    return "Đã gửi";
  };

  return (
    <div className="flex items-center justify-end gap-1 mt-0.5 text-xs text-muted-foreground">
      <span>{getStatusText()}</span>
      {isSeen && <CheckCheck className="size-3.5 text-primary shrink-0" />}
    </div>
  );
}
