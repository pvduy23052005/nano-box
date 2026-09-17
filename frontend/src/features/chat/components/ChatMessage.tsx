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
import DOMPurify from "isomorphic-dompurify";
import { MessageGroup } from "../types/chat.types";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Download from "yet-another-react-lightbox/plugins/download";
import "yet-another-react-lightbox/styles.css";
import { CheckCheck } from "lucide-react";
import Image from "next/image";

export interface ChatMessageGroupProps extends MessageGroup {
  isLastGroup?: boolean;
  isSeen?: boolean;
}

export default function ChatMessage({
  isMe,
  avatar,
  messages,
  isLastGroup,
  isSeen,
}: ChatMessageGroupProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const [lightboxSlides, setLightboxSlides] = useState<{ src: string }[]>([]);

  const lastMessage = messages[messages.length - 1];
  const isSending = lastMessage?.id?.startsWith("temp-");
  const showStatus = isMe && (isSending || isLastGroup);

  const getStatusText = () => {
    if (isSending) return "Đang gửi...";
    if (isSeen) return "Đã xem";
    return "Đã gửi";
  };

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
        setLightboxSlides(allImgs.length > 0 ? allImgs : [{ src: clickedSrc }]);
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
              <AvatarImage src={avatar ? avatar : "/logo.svg"} />
              <AvatarFallback>user</AvatarFallback>
            </Avatar>
          </MessageAvatar>
        )}
        <MessageContent>
          <BubbleGroup>
            {messages.map((msg) => {
              const cleanContent = DOMPurify.sanitize(msg.content);

              const attachmentImages = (msg.attachments ?? []).filter(
                (url) =>
                  url.startsWith("blob:") ||
                  url.startsWith("data:image/") ||
                  /\.(jpg|jpeg|png|gif|webp|avif|heic|heif|svg|bmp|ico|tiff|tif)(\?.*)?$/i.test(
                    url,
                  ),
              );

              return (
                <div key={msg.id} className="flex flex-col gap-1">
                  {attachmentImages.length > 0 && (
                    <Bubble variant="ghost">
                      <BubbleContent>
                        <div
                          className="flex flex-wrap gap-1.5"
                          onClick={handleContentClick}
                        >
                          {attachmentImages.map((url, idx) => (
                            <Image
                              key={idx}
                              src={url}
                              alt={`attachment-${idx}`}
                              width={288}
                              height={288}
                              unoptimized
                              className="rounded-lg max-h-72 max-w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            />
                          ))}
                        </div>
                      </BubbleContent>
                    </Bubble>
                  )}
                  {cleanContent && (
                    <Bubble variant={isMe ? "default" : "muted"}>
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
                  )}
                </div>
              );
            })}
          </BubbleGroup>
          {showStatus && (
            <div className="flex items-center justify-end gap-1 mt-0.5 text-xs text-muted-foreground">
              <span>{getStatusText()}</span>
              {isSeen && (
                <CheckCheck className="size-3.5 text-primary shrink-0" />
              )}
            </div>
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
