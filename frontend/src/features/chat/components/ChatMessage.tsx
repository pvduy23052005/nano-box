"use client";

import { memo } from "react";
import { Message, MessageContent } from "@/src/components/ui/message";
import { BubbleGroup } from "@/src/components/ui/bubble";
import { MessageGroup } from "../types/chat.types";
import { useLightboxStore } from "../stores/useLightboxStore";
import { useAddEmojiMessage } from "../hooks/useAddEmojiMessage";
import { formatChatTimestamp } from "@/src/utils/formatTime";
import { ChatMessageAvatar } from "./message/ChatMessageAvatar";
import { ChatMessageStatus } from "./message/ChatMessageStatus";
import { ChatMessageItem } from "./message/ChatMessageItem";

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

  const lastMessage = messages[messages.length - 1];
  const isSending = lastMessage?.id?.startsWith("temp-");
  const showStatus = isMe && (isSending || isLastGroup);

  return (
    <Message align={isMe ? "end" : "start"}>
      {!isMe && (
        <ChatMessageAvatar avatar={avatar} senderName={senderName} />
      )}
      <MessageContent>
        <BubbleGroup className="gap-1">
          {messages.map((message, index) => {
            const timeText = formatChatTimestamp(message.createdAt);
            const nextMsg = messages[index + 1];
            const nextTimeText = nextMsg
              ? formatChatTimestamp(nextMsg.createdAt)
              : null;
            const isLastOfTimeGroup =
              !nextMsg || !nextTimeText || timeText !== nextTimeText;
            const shouldShowTimestamp = Boolean(timeText) && isLastOfTimeGroup;

            return (
              <ChatMessageItem
                key={message.id}
                message={message}
                isMe={isMe}
                shouldShowTimestamp={shouldShowTimestamp}
                onOpenLightbox={openLightbox}
                onAddEmoji={addEmoji}
              />
            );
          })}
        </BubbleGroup>
        {showStatus && (
          <ChatMessageStatus isSending={isSending} isSeen={isSeen} />
        )}
      </MessageContent>
    </Message>
  );
}

export default memo(ChatMessage);
