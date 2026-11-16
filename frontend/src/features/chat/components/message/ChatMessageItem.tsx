"use client";

import DOMPurify from "isomorphic-dompurify";
import { Bubble, BubbleContent } from "@/src/components/ui/bubble";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/src/components/ui/tooltip";
import { cn } from "@/src/lib/utils";
import { Message } from "../../types/chat.types";
import { formatChatTimestamp, formatFullTimestamp } from "@/src/utils/formatTime";
import ChatMessageFile from "../ChatMesssageFile";
import ChatImageAlbum from "../ChatImageAlbum";
import { ChatMessageReactions } from "./ChatMessageReactions";
import { ChatMessageActions } from "./ChatMessageActions";

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

export interface ChatMessageItemProps {
  message: Message;
  isMe: boolean;
  shouldShowTimestamp: boolean;
  onOpenLightbox: (images: { src: string }[], index: number) => void;
  onAddEmoji: (messageId: string, emoji: string) => void;
}

export function ChatMessageItem({
  message,
  isMe,
  shouldShowTimestamp,
  onOpenLightbox,
  onAddEmoji,
}: ChatMessageItemProps) {
  const isSending = message.id.startsWith("temp-");
  const timeText = formatChatTimestamp(message.createdAt);
  const fullTimeText = formatFullTimestamp(message.createdAt, isSending);

  const cleanContent = DOMPurify.sanitize(message.content, {
    ADD_TAGS: ["span"],
    ADD_ATTR: ["data-type", "data-id", "data-label"],
  });

  const attachmentImages = (message.attachments ?? []).filter(isImageAttachment);
  const attachmentFiles = (message.attachments ?? []).filter(
    (url) => !isImageAttachment(url),
  );

  const hasReactions = Boolean(message.reactions && message.reactions.length > 0);

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
        onOpenLightbox(
          allImgs.length > 0 ? allImgs : [{ src: clickedSrc }],
          index >= 0 ? index : 0,
        );
      }
    }
  };

  const renderTimestamp = () => {
    if (!timeText) return null;
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <span className="text-[11px] text-muted-foreground font-normal leading-none select-none cursor-default transition-colors hover:text-foreground shrink-0 px-0.5" />
          }
        >
          {timeText}
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={4} className="text-xs px-2 py-1">
          {fullTimeText}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div
      className={cn(
        "group/msg relative flex items-center gap-2 w-full",
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
                  onOpenLightbox(
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
          <Bubble variant={isMe ? "default" : "muted"} className="max-w-full">
            <BubbleContent className="max-w-full shadow-lg">
              <div
                className="chat-html-content w-fit max-w-full break-words [&_img]:rounded-lg [&_img]:max-h-72 [&_img]:w-auto [&_img]:object-cover [&_img]:my-1.5 [&_img]:cursor-pointer hover:[&_img]:opacity-90 transition-opacity"
                onClick={handleContentClick}
                dangerouslySetInnerHTML={{ __html: cleanContent }}
              />
            </BubbleContent>
          </Bubble>
        )}

        {(hasReactions || shouldShowTimestamp) && (
          <div
            className={cn(
              "flex items-center gap-1.5 mt-1 px-0.5 flex-wrap select-none",
              isMe ? "justify-end self-end" : "justify-start self-start",
            )}
          >
            {isMe && shouldShowTimestamp && renderTimestamp()}
            <ChatMessageReactions
              reactions={message.reactions}
              isMe={isMe}
              onAddEmoji={(emoji) => onAddEmoji(message.id, emoji)}
            />
            {!isMe && shouldShowTimestamp && renderTimestamp()}
          </div>
        )}
      </div>

      {!isSending && (
        <ChatMessageActions
          isMe={isMe}
          timeText={timeText}
          fullTimeText={fullTimeText}
          showHoverTime={!shouldShowTimestamp && Boolean(timeText)}
          onAddEmoji={(emoji) => onAddEmoji(message.id, emoji)}
        />
      )}
    </div>
  );
}
