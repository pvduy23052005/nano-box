"use client";

import { BubbleReactions } from "@/src/components/ui/bubble";
import { MessageReaction } from "../../types/chat.types";

export interface ChatMessageReactionsProps {
  reactions?: MessageReaction[] | null;
  isMe: boolean;
  onAddEmoji: (emoji: string) => void;
}

export function ChatMessageReactions({
  reactions,
  isMe,
  onAddEmoji,
}: ChatMessageReactionsProps) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <BubbleReactions
      role="img"
      aria-label="Reaction"
      align={isMe ? "end" : "start"}
      side="bottom"
      className="static translate-y-0 rounded-full text-xs cursor-pointer hover:scale-105 transition-all z-10 px-2 py-0.5 select-none"
    >
      <span className="flex items-center gap-1.5">
        {reactions.map((reaction) => (
          <span
            key={reaction.emoji}
            className="flex items-center gap-0.5 cursor-pointer hover:scale-110 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              onAddEmoji(reaction.emoji);
            }}
          >
            <span>{reaction.emoji}</span>
            {reaction.userIds.length > 1 && (
              <span className="text-[10px] text-muted-foreground font-medium">
                {reaction.userIds.length}
              </span>
            )}
          </span>
        ))}
      </span>
    </BubbleReactions>
  );
}
