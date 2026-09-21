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
import {
  BubbleGroup,
  Bubble,
  BubbleContent,
  BubbleReactions,
} from "@/src/components/ui/bubble";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/src/components/ui/popover";
import DOMPurify from "isomorphic-dompurify";
import { MessageGroup } from "../types/chat.types";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Download from "yet-another-react-lightbox/plugins/download";
import "yet-another-react-lightbox/styles.css";
import { CheckCheck, Smile } from "lucide-react";
import Image from "next/image";
import { useAddEmojiMessage } from "../hooks/useAddEmojiMessage";
import { cn } from "@/src/lib/utils";
import ChatMessageFile from "./ChatMesssageFile";

const QUICK_REACTIONS = [
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢",
  "😡",
  "🫪",
  "👀",
  "😭",
];

const IMAGE_REGEX =
  /\.(jpg|jpeg|png|gif|webp|avif|heic|heif|svg|bmp|ico|tiff|tif)(\?.*)?$/i;

const isImageAttachment = (url: string) => {
  if (url.startsWith("data:image/")) return true;
  if (url.startsWith("blob:")) {
    if (url.includes("#name=")) {
      const namePart = decodeURIComponent(url.split("#name=")[1].split("&")[0]);
      return IMAGE_REGEX.test(namePart);
    }
    return true;
  }
  return IMAGE_REGEX.test(url);
};

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
  const { addEmoji } = useAddEmojiMessage();
  const [activePopoverMsgId, setActivePopoverMsgId] = useState<string | null>(
    null,
  );
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

              const attachmentImages = (msg.attachments ?? []).filter(isImageAttachment);
              const attachmentFiles = (msg.attachments ?? []).filter(
                (url) => !isImageAttachment(url),
              );

              const hasReactions = Boolean(
                msg.reactions && msg.reactions.length > 0,
              );

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "group/msg relative flex items-center gap-2 w-full",
                    isMe ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <div className="flex flex-col max-w-[80%] min-w-0">
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
                    {attachmentFiles.length > 0 && (
                      <div className="flex flex-col gap-1.5 my-1 w-full">
                        {attachmentFiles.map((url, idx) => (
                          <ChatMessageFile key={idx} url={url} isMe={isMe} />
                        ))}
                      </div>
                    )}
                    {cleanContent && (
                      <Bubble
                        variant={isMe ? "default" : "muted"}
                        className={cn(
                          hasReactions &&
                            "has-[[data-slot=bubble-reactions]]:mb-3.5",
                        )}
                      >
                        <BubbleContent>
                          <div
                            className="w-max max-w-full [&_img]:rounded-lg [&_img]:max-h-72 [&_img]:w-auto [&_img]:object-cover [&_img]:my-1.5 [&_img]:cursor-pointer hover:[&_img]:opacity-90 transition-opacity"
                            onClick={handleContentClick}
                            dangerouslySetInnerHTML={{
                              __html: cleanContent,
                            }}
                          />
                        </BubbleContent>
                        {hasReactions && (
                          <BubbleReactions
                            role="img"
                            aria-label="Reaction"
                            align={isMe ? "end" : "start"}
                            side="bottom"
                            className="bg-background border border-border/50 shadow-xs rounded-full px-2 py-0.5 text-xs ring-2 ring-background cursor-pointer hover:bg-muted/80 transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              {msg.reactions!.map((r) => (
                                <span
                                  key={r.emoji}
                                  className="flex items-center gap-0.5 cursor-pointer hover:scale-110 transition-transform"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addEmoji(msg.id, r.emoji);
                                  }}
                                >
                                  <span>{r.emoji}</span>
                                  {r.userIds.length > 1 && (
                                    <span className="text-[10px] text-muted-foreground font-medium">
                                      {r.userIds.length}
                                    </span>
                                  )}
                                </span>
                              ))}
                            </span>
                          </BubbleReactions>
                        )}
                      </Bubble>
                    )}
                  </div>

                  {!msg.id.startsWith("temp-") && (
                    <Popover
                      open={activePopoverMsgId === msg.id}
                      onOpenChange={(open) =>
                        setActivePopoverMsgId(open ? msg.id : null)
                      }
                    >
                      <PopoverTrigger
                        type="button"
                        aria-label="Thả cảm xúc"
                        className={cn(
                          "p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer shrink-0 transition-all focus-visible:opacity-100",
                          activePopoverMsgId === msg.id
                            ? "opacity-100 bg-muted text-foreground"
                            : "opacity-0 group-hover/msg:opacity-100",
                        )}
                      >
                        <Smile className="size-4" />
                      </PopoverTrigger>
                      <PopoverContent
                        side="top"
                        sideOffset={6}
                        align={isMe ? "end" : "start"}
                        className="p-1 rounded-full bg-background/95 backdrop-blur-md border border-border/50 shadow-lg"
                      >
                        <div className="flex items-center gap-1 px-1 py-0.5">
                          {QUICK_REACTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                addEmoji(msg.id, emoji);
                                setActivePopoverMsgId(null);
                              }}
                              className="p-1.5 text-lg hover:scale-125 transition-transform hover:bg-muted/80 rounded-full cursor-pointer flex items-center justify-center leading-none"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
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
