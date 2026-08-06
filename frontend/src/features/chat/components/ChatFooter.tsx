"use client";

import { useState } from "react";
import { useSendMessage } from "../hooks/useSendMessage";
import { Button } from "@/src/components/ui/button";
import {
  Smile,
  AtSign,
  FileText,
  SendHorizontal,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  ListOrdered,
  List,
  Outdent,
  Code,
} from "lucide-react";

export default function ChatFooter() {
  const [message, setMessage] = useState("");
  const { sendMessage } = useSendMessage();

  const handleSend = () => {
    if (!message.trim()) {
      return;
    }
    sendMessage(message);
    setMessage("");
  };

  return (
    <div className="bg-background/80 p-2">
      <div className="flex flex-col bg-card border rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-ring">
        <div className="flex items-center gap-0.5 p-2 border-b bg-muted/30 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            <Bold className="size-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            <Italic className="size-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            <Underline className="size-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            <Strikethrough className="size-4.5" />
          </Button>

          <div className="w-[1px] h-4 bg-border mx-1 shrink-0" />

          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            <Link className="size-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            <ListOrdered className="size-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            <List className="size-4.5" />
          </Button>

          <div className="w-[1px] h-4 bg-border mx-1 shrink-0" />

          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            <Outdent className="size-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            <Code className="size-4.5" />
          </Button>
        </div>

        <textarea
          className="w-full min-h-[50px] max-h-[150px] resize-none border-0 bg-transparent p-3 text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Nhập tin nhắn..."
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="size-10 text-muted-foreground hover:text-foreground"
            >
              <Smile className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="size-10 text-muted-foreground hover:text-foreground"
            >
              <AtSign className="size-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="size-10 text-muted-foreground hover:text-foreground"
            >
              <FileText className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="size-10 text-primary hover:text-primary/80"
              onClick={handleSend}
            >
              <SendHorizontal className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
