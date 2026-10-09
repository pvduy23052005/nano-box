"use client";

import { useMemo } from "react";
import { Info, LogOut, ShieldCheck, UserMinus, UserPlus } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ChatSystemMessageProps {
  content: string;
  createdAt?: string | Date | null;
  className?: string;
}

export default function ChatSystemMessage({
  content,
  createdAt,
  className,
}: ChatSystemMessageProps) {
  const Icon = useMemo(() => {
    const lower = content.toLowerCase();
    if (lower.includes("rời khỏi")) return LogOut;
    if (lower.includes("xóa") && lower.includes("khỏi")) return UserMinus;
    if (lower.includes("thêm") && lower.includes("vào")) return UserPlus;
    if (lower.includes("quản trị viên")) return ShieldCheck;
    return Info;
  }, [content]);

  const formattedTime = useMemo(() => {
    if (!createdAt) return null;
    try {
      const date = new Date(createdAt);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  }, [createdAt]);

  return (
    <div
      className={cn("w-full flex justify-center items-center  px-4", className)}
    >
      <div className="inline-flex items-center gap-1 max-w-[90%] sm:max-w-md px-3.5 rounded-full  text-xs text-muted-foreground select-none">
        <Icon className="size-3.5 shrink-0 opacity-80" />
        <span className="text-center font-medium leading-relaxed break-words">
          {content}
        </span>
        {formattedTime && (
          <span className="text-[10px] text-muted-foreground/60 shrink-0 ml-0.5">
            {formattedTime}
          </span>
        )}
      </div>
    </div>
  );
}
