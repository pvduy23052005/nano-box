"use client";

import { useState } from "react";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/src/components/ui/message";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { BubbleGroup, Bubble, BubbleContent } from "@/src/components/ui/bubble";
import { Typography } from "@/src/components/ui/typography";
import DOMPurify from "isomorphic-dompurify";
import { MessageGroup } from "../types/chat.types";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Download from "yet-another-react-lightbox/plugins/download";
import "yet-another-react-lightbox/styles.css";

export interface ChatMessageGroupProps extends MessageGroup {
  isLastGroup?: boolean;
}

export default function ChatMessage({
  isMe,
  avatar,
  messages,
  isLastGroup,
}: ChatMessageGroupProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const [lightboxSlides, setLightboxSlides] = useState<{ src: string }[]>([]);

  const lastMessage = messages[messages.length - 1];
  const isSending = lastMessage?.id?.startsWith("temp-");
  const showStatus = isMe && (isSending || isLastGroup);

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      const clickedSrc = (target as HTMLImageElement).src;
      if (clickedSrc) {
        const container = e.currentTarget;
        const allImgs = Array.from(container.querySelectorAll("img")).map(
          (img) => ({ src: img.src }),
        );
        const index = allImgs.findIndex((img) => img.src === clickedSrc);
        setLightboxSlides(
          allImgs.length > 0 ? allImgs : [{ src: clickedSrc }],
        );
        setLightboxIndex(index >= 0 ? index : 0);
      }
    }
  };

  return (
    <>
      <Message align={isMe ? "end" : "start"}>
        {!isMe && (
          <MessageAvatar>
            <Avatar>
              <AvatarImage src={avatar} />
              <AvatarFallback>user</AvatarFallback>
            </Avatar>
          </MessageAvatar>
        )}
        <MessageContent>
          <BubbleGroup>
            {messages.map((msg) => {
              const cleanContent = DOMPurify.sanitize(msg.content);
              return (
                <Bubble key={msg.id} variant={isMe ? "default" : "muted"}>
                  <BubbleContent>
                    <div
                      className="w-max max-w-full [&_img]:rounded-lg [&_img]:max-h-72 [&_img]:w-auto [&_img]:object-cover [&_img]:my-1.5 [&_img]:cursor-pointer hover:[&_img]:opacity-90 transition-opacity"
                      onClick={handleContentClick}
                      dangerouslySetInnerHTML={{
                        __html: cleanContent,
                      }}
                    />
                  </BubbleContent>
                </Bubble>
              );
            })}
          </BubbleGroup>
          {showStatus && (
            <Typography variant="caption" className="text-right">
              {isSending ? "Đang gửi..." : "Đã gửi"}
            </Typography>
          )}
        </MessageContent>
      </Message>

      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
        slides={lightboxSlides}
        plugins={[Zoom, Fullscreen, Download]}
      />
    </>
  );
}
