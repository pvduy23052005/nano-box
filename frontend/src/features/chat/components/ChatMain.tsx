"use client";

import { useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useGetMessages } from "../hooks/useGetMessages";
import LogoSpinner from "@/src/components/common/LogoSpinner";
import ChatLoading from "./ChatLoading";
import ChatMessage from "./ChatMessage";
import ChatTypingIndicator from "./ChatTypingIndicator";
import { useMarkAsRead } from "../hooks/useMarkAsRead";
import { useTypingStore } from "../stores/useTypingStore";
import { useReadReceiptStore } from "../stores/useReadReceiptStore";
import { useRoomStore } from "../../room/stores/useRoomStore";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { Message, MessageGroup } from "../types/chat.types";
import { MessageSquareDashed } from "lucide-react";
import { Typography } from "@/src/components/ui/typography";

export default function ChatMain() {
  const {
    messages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetMessages();
  const { activeRoomId } = useRoomStore();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const typingByRoom = useTypingStore((state) => state.typingByRoom);

  const otherMemberMaxReadMessageId = useReadReceiptStore((state) =>
    activeRoomId
      ? state.getOtherMembersMaxReadMessageId(activeRoomId, currentUserId)
      : null,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useMarkAsRead(activeRoomId, messages);

  const typingList = useMemo(() => {
    if (!activeRoomId || !typingByRoom[activeRoomId]) return [];
    return Object.values(typingByRoom[activeRoomId]);
  }, [activeRoomId, typingByRoom]);
  const { ref: loadMoreRef, inView } = useInView();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef<number>(0);
  const previousScrollTop = useRef<number>(0);

  useEffect(() => {
    if (isFetchingNextPage && scrollContainerRef.current) {
      previousScrollHeight.current = scrollContainerRef.current.scrollHeight;
      previousScrollTop.current = scrollContainerRef.current.scrollTop;
    }
  }, [isFetchingNextPage]);

  useLayoutEffect(() => {
    if (
      !isFetchingNextPage &&
      previousScrollHeight.current > 0 &&
      scrollContainerRef.current
    ) {
      const newScrollHeight = scrollContainerRef.current.scrollHeight;
      const heightDifference = newScrollHeight - previousScrollHeight.current;

      if (heightDifference > 0) {
        scrollContainerRef.current.scrollTop =
          previousScrollTop.current + heightDifference;
      }
      previousScrollHeight.current = 0;
    }
  }, [isFetchingNextPage, messages.length]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const lastMessageId =
    messages.length > 0 ? messages[messages.length - 1].id : null;

  useEffect(() => {
    scrollToBottom();
  }, [lastMessageId, typingList.length]);

  const messageGroups = useMemo(() => {
    const seenMessageIds = new Set<string>();

    return messages.reduce<MessageGroup[]>(
      (groups: MessageGroup[], message: Message, index: number) => {
        if (message.id) {
          if (seenMessageIds.has(message.id)) {
            return groups;
          }
          seenMessageIds.add(message.id);
        }

        const lastGroup = groups[groups.length - 1];
        const isSameSender =
          lastGroup &&
          lastGroup.isMe === message.isMe &&
          (!lastGroup.senderId || !message.senderId || lastGroup.senderId === message.senderId);

        if (isSameSender) {
          lastGroup.messages.push(message);
        } else {
          const groupId = `group-${message.senderId || (message.isMe ? "me" : "other")}-${message.createdAt || index}-${index}`;
          groups.push({
            id: groupId,
            isMe: message.isMe,
            senderId: message.senderId,
            avatar: message.avatar,
            messages: [message],
          });
        }
        return groups;
      },
      [],
    );
  }, [messages]);

  if (!activeRoomId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-muted-foreground gap-3">
        <div className="flex items-center justify-center size-12 rounded-full bg-muted/60 text-muted-foreground/80">
          <MessageSquareDashed className="size-6 stroke-[1.5]" />
        </div>
        <Typography variant="small" className="text-xs text-muted-foreground">
          Chọn một cuộc trò chuyện để bắt đầu
        </Typography>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 min-h-0 flex flex-col gap-4 px-3 py-3 overflow-y-auto overflow-x-hidden"
    >
      {isLoading && messages.length === 0 ? (
        <ChatLoading />
      ) : (
        <>
          {hasNextPage && (
            <div ref={loadMoreRef} className="h-4 w-full flex-shrink-0" />
          )}

          {isFetchingNextPage && (
            <div className="flex justify-center py-4 w-full">
              <LogoSpinner size="sm" showText={true} />
            </div>
          )}

          {messageGroups.map((group, index) => {
            const isLastGroup = index === messageGroups.length - 1;
            const lastGroupMessage = group.messages[group.messages.length - 1];
            const isSeen =
              group.isMe &&
              !lastGroupMessage?.id?.startsWith("temp-") &&
              !!otherMemberMaxReadMessageId &&
              lastGroupMessage.id <= otherMemberMaxReadMessageId;

            return (
              <ChatMessage
                key={group.id}
                isLastGroup={isLastGroup}
                isSeen={isSeen}
                {...group}
              />
            );
          })}
        </>
      )}

      <ChatTypingIndicator typingUsers={typingList} />
      <div ref={messagesEndRef} />
    </div>
  );
}
