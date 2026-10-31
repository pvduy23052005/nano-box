"use client";

import { useState, memo } from "react";
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/src/components/ui/tooltip";
import DOMPurify from "isomorphic-dompurify";
import { MessageGroup } from "../types/chat.types";
import { useLightboxStore } from "../stores/useLightboxStore";
import { CheckCheck, Smile } from "lucide-react";
import { useAddEmojiMessage } from "../hooks/useAddEmojiMessage";
import { cn } from "@/src/lib/utils";
import ChatMessageFile from "./ChatMesssageFile";
import ChatImageAlbum from "./ChatImageAlbum";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡", "🫪", "👀", "😭"];

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

export function ChatMessage({
  isMe,
  avatar,
  senderName,
  messages,
  isLastGroup,
  isSeen,
}: ChatMessageGroupProps) {
  const { addEmoji } = useAddEmojiMessage();
  const openLightbox = useLightboxStore((state) => state.openLightbox);
  const [activePopoverMsgId, setActivePopoverMsgId] = useState<string | null>(
    null,
  );

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
        openLightbox(
          allImgs.length > 0 ? allImgs : [{ src: clickedSrc }],
          index >= 0 ? index : 0,
        );
      }
    }
  };

  const initials = senderName
    ? senderName.trim().slice(0, 2).toUpperCase()
    : "U";

  return (
    <Message align={isMe ? "end" : "start"}>
      {!isMe && (
        <MessageAvatar>
          <Tooltip>
            <TooltipTrigger
              render={
                <span className="inline-flex cursor-pointer rounded-full transition-transform hover:scale-105 active:scale-95" />
              }
            >
              <Avatar className="size-8 rounded-full after:hidden">
                {avatar ? (
                  <AvatarImage
                    src={avatar}
                    alt={senderName ?? "Avatar"}
                    className="object-cover size-full rounded-full"
                  />
                ) : null}
                <AvatarFallback className="bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" sideOffset={6}>
              {senderName || "Người dùng"}
            </TooltipContent>
          </Tooltip>
        </MessageAvatar>
      )}
      <MessageContent>
        <BubbleGroup>
          {messages.map((msg) => {
            const cleanContent = DOMPurify.sanitize(msg.content, {
              ADD_TAGS: ["span"],
              ADD_ATTR: ["data-type", "data-id", "data-label"],
            });

            const attachmentImages = (msg.attachments ?? []).filter(
              isImageAttachment,
            );
            const attachmentFiles = (msg.attachments ?? []).filter(
              (url) => !isImageAttachment(url),
            );

            const hasReactions = Boolean(
              msg.reactions && msg.reactions.length > 0,
            );

            const renderReactions = () => {
              if (!hasReactions || !msg.reactions?.length) return null;
              return (
                <BubbleReactions
                  role="img"
                  aria-label="Reaction"
                  align={isMe ? "end" : "start"}
                  side="bottom"
                  className={cn(
                    "static translate-y-0 mt-1  rounded-full text-xs cursor-pointer hover:scale-105 transition-all z-10 px-2 py-0.5 select-none",
                    isMe ? "self-end" : "self-start",
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {msg.reactions.map((reaction) => (
                      <span
                        key={reaction.emoji}
                        className="flex items-center gap-0.5 cursor-pointer hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          addEmoji(msg.id, reaction.emoji);
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
            };

            return (
              <div
                key={msg.id}
                className={cn(
                  "group/msg relative flex items-center gap-2 w-full ",
                  isMe ? "flex-row-reverse" : "flex-row",
                )}
              >
                <div
                  className={cn(
                    "flex flex-col max-w-[85%] sm:max-w-[75%] min-w-0",
                    isMe ? "items-end" : "items-start",
                  )}
                >
                  {attachmentImages.length > 0 && (
                    <Bubble
                      variant="ghost"
                      align={isMe ? "end" : "start"}
                      className="max-w-full overflow-visible"
                    >
                      <BubbleContent className="p-0">
                        <ChatImageAlbum
                          images={attachmentImages}
                          onImageClick={(idx) => {
                            openLightbox(
                              attachmentImages.map((src) => ({ src })),
                              idx,
                            );
                          }}
                        />
                      </BubbleContent>
                    </Bubble>
                  )}
                  {attachmentFiles.length > 0 && (
                    <div className="relative flex flex-col gap-1.5 my-1 w-full max-w-full">
                      {attachmentFiles.map((url, idx) => (
                        <ChatMessageFile key={idx} url={url} isMe={isMe} />
                      ))}
                    </div>
                  )}
                  {cleanContent && (
                    <Bubble
                      variant={isMe ? "default" : "muted"}
                      className="max-w-full"
                    >
                      <BubbleContent className={cn("max-w-full shadow-lg")}>
                        <div
                          className="chat-html-content w-fit max-w-full break-words [&_img]:rounded-lg [&_img]:max-h-72 [&_img]:w-auto [&_img]:object-cover [&_img]:my-1.5 [&_img]:cursor-pointer hover:[&_img]:opacity-90 transition-opacity"
                          onClick={handleContentClick}
                          dangerouslySetInnerHTML={{
                            __html: cleanContent,
                          }}
                        />
                      </BubbleContent>
                    </Bubble>
                  )}
                  {renderReactions()}
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
                      className="p-1 rounded-full bg-background/95 backdrop-blur-md border shadow-lg"
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
                            className="p-1 text-lg hover:scale-125 transition-transform hover:bg-muted/80 rounded-full cursor-pointer flex items-center justify-center leading-none"
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
  );
}

export default memo(ChatMessage);
