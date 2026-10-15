"use client";

import { useMemo } from "react";
import { useGetMessages } from "../hooks/useGetMessages";
import { useMessageGroups } from "../hooks/useMessageGroups";
import { useChatVirtualScroll } from "../hooks/useChatVirtualScroll";
import { useMarkAsRead } from "../hooks/useMarkAsRead";
import { useChatRoomSubscription } from "../hooks/useChatRoomSubscription";
import { useTypingStore } from "../stores/useTypingStore";
import { useReadReceiptStore } from "../stores/useReadReceiptStore";
import { useRoomStore } from "../../room/stores/useRoomStore";
import { useAuthStore } from "../../auth/store/useAuthStore";
import LogoSpinner from "@/src/components/common/LogoSpinner";
import ChatLoading from "./ChatLoading";
import ChatMessage from "./ChatMessage";
import ChatSystemMessage from "./ChatSystemMessage";
import ChatTypingIndicator from "./ChatTypingIndicator";
import ChatLightbox from "./ChatLightbox";
import ChatEmptyPlaceholder from "./ChatEmptyPlaceholder";

export default function ChatMain() {
  const {
    messages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetMessages();
  const activeRoomId = useRoomStore((state) => state.activeRoomId);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const typingByRoom = useTypingStore((state) => state.typingByRoom);

  const otherMemberMaxReadMessageId = useReadReceiptStore((state) =>
    activeRoomId
      ? state.getOtherMembersMaxReadMessageId(activeRoomId, currentUserId)
      : null,
  );

  useChatRoomSubscription(activeRoomId);
  useMarkAsRead(activeRoomId, messages);

  const typingList = useMemo(() => {
    if (!activeRoomId || !typingByRoom[activeRoomId]) return [];
    return Object.values(typingByRoom[activeRoomId]);
  }, [activeRoomId, typingByRoom]);

  const messageGroups = useMessageGroups(messages);

  const { scrollContainerRef, virtualizer, virtualItems } =
    useChatVirtualScroll({
      messageGroups,
      messages,
      activeRoomId,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
      typingCount: typingList.length,
    });

  if (!activeRoomId) {
    return <ChatEmptyPlaceholder />;
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 min-h-0 flex flex-col px-3 overflow-y-auto overflow-x-hidden relative"
    >
      {isLoading && messages.length === 0 ? (
        <ChatLoading />
      ) : (
        <>
          {isFetchingNextPage && (
            <div className="sticky top-2 z-20 flex justify-center w-full pointer-events-none mb-2">
              <div className="bg-background/90 backdrop-blur-md shadow-md rounded-full px-3 py-1.5 border border-border flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in duration-200">
                <LogoSpinner size="sm" showText={false} />
                <span>Đang tải thêm tin nhắn...</span>
              </div>
            </div>
          )}

          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualItems.map((virtualItem) => {
              const group = messageGroups[virtualItem.index];
              if (!group) return null;

              const isLastGroup = virtualItem.index === messageGroups.length - 1;
              const lastGroupMessage = group.messages[group.messages.length - 1];
              const isSeen =
                group.isMe &&
                !lastGroupMessage?.id?.startsWith("temp-") &&
                !!otherMemberMaxReadMessageId &&
                lastGroupMessage.id <= otherMemberMaxReadMessageId;

              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  {group.isSystem ? (
                    <ChatSystemMessage
                      content={group.messages[0]?.content ?? ""}
                      createdAt={group.messages[0]?.createdAt}
                    />
                  ) : (
                    <ChatMessage
                      isLastGroup={isLastGroup}
                      isSeen={isSeen}
                      {...group}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <ChatTypingIndicator typingUsers={typingList} />
      <div className="h-px shrink-0" />
      <ChatLightbox />
    </div>
  );
}
