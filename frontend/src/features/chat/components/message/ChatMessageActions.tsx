"use client";

import { useState } from "react";
import { Smile } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/src/components/ui/popover";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/src/components/ui/tooltip";
import { cn } from "@/src/lib/utils";

export const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡", "🫪", "👀", "😭"];

export interface ChatMessageActionsProps {
  isMe: boolean;
  timeText?: string;
  fullTimeText?: string;
  showHoverTime: boolean;
  onAddEmoji: (emoji: string) => void;
}

export function ChatMessageActions({
  isMe,
  timeText,
  fullTimeText,
  showHoverTime,
  onAddEmoji,
}: ChatMessageActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        "flex items-center gap-1 shrink-0 transition-opacity",
        isMe ? "flex-row-reverse" : "flex-row",
        isOpen ? "opacity-100" : "opacity-0 group-hover/msg:opacity-100",
      )}
    >
      {showHoverTime && timeText && (
        <Tooltip>
          <TooltipTrigger
            render={
              <span className="text-[10px] text-muted-foreground font-normal select-none cursor-default px-1 py-0.5 rounded hover:bg-muted" />
            }
          >
            {timeText}
          </TooltipTrigger>
          <TooltipContent
            side="top"
            sideOffset={4}
            className="text-xs px-2 py-1"
          >
            {fullTimeText}
          </TooltipContent>
        </Tooltip>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          type="button"
          aria-label="Thả cảm xúc"
          className={cn(
            "p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer shrink-0 transition-all focus-visible:opacity-100",
            isOpen ? "bg-muted text-foreground" : "",
          )}
        >
          <Smile className="size-4" />
        </PopoverTrigger>
        <PopoverContent
          side="top"
          sideOffset={6}
          align={isMe ? "end" : "start"}
          className="p-1 rounded-full bg-background/95 backdrop-blur-md border shadow-lg"
        >
          <div className="flex items-center gap-1 px-1 py-0.5">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onAddEmoji(emoji);
                  setIsOpen(false);
                }}
                className="p-1 text-lg hover:scale-125 transition-transform hover:bg-muted/80 rounded-full cursor-pointer flex items-center justify-center leading-none"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
