"use client";

import dynamic from "next/dynamic";
import { Smile } from "lucide-react";
import type { EmojiClickData } from "emoji-picker-react";
import { Theme } from "emoji-picker-react";

import { Button } from "@/src/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[380px] w-[340px] items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground shadow-lg">
      Đang tải biểu tượng...
    </div>
  ),
});

interface ChatEmojiPickerProps {
  onSelect: (emoji: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function ChatEmojiPicker({
  onSelect,
  disabled = false,
  className,
}: ChatEmojiPickerProps) {
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onSelect(emojiData.emoji);
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            type="button"
            disabled={disabled}
            className={`size-10 text-muted-foreground hover:text-foreground cursor-pointer ${
              className || ""
            }`}
            title="Chèn biểu tượng cảm xúc"
          >
            <Smile className="size-5" />
          </Button>
        }
      />
      <PopoverContent
        side="top"
        align="start"
        sideOffset={10}
        className="p-0 border-0 shadow-2xl rounded-2xl overflow-hidden bg-transparent"
      >
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          autoFocusSearch={false}
          theme={Theme.AUTO}
          searchPlaceHolder="Tìm biểu tượng cảm xúc..."
          lazyLoadEmojis={true}
          width={340}
          height={400}
        />
      </PopoverContent>
    </Popover>
  );
}
