"use client";

import { MessageSquareDashed } from "lucide-react";
import { Typography } from "@/src/components/ui/typography";

export default function ChatEmptyPlaceholder() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 text-center text-muted-foreground gap-3">
      <div className="flex items-center justify-center size-12 rounded-full bg-muted/60 text-muted-foreground/80">
        <MessageSquareDashed className="size-6 stroke-[1.5]" />
      </div>
      <Typography variant="small" className="text-xs text-muted-foreground">
        Chọn một cuộc trò chuyện để bắt đầu
      </Typography>
    </div>
  );
}
