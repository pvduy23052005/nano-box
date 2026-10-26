import { useEffect, useRef, useLayoutEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Message, MessageGroup } from "../types/chat.types";

interface UseChatVirtualScrollProps {
  messageGroups: MessageGroup[];
  messages: Message[];
  activeRoomId: string | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void | Promise<void>;
  typingCount?: number;
}

export function useChatVirtualScroll({
  messageGroups,
  messages,
  activeRoomId,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  typingCount = 0,
}: UseChatVirtualScrollProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: messageGroups.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 80,
    getItemKey: (index) => messageGroups[index]?.id ?? index,
    anchorTo: "end",
    followOnAppend: true,
    scrollEndThreshold: 80,
    gap: 16,
    paddingStart: 12,
    paddingEnd: 12,
    overscan: 6,
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    const firstItem = virtualItems[0];
    if (!firstItem) return;

    if (firstItem.index <= 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [virtualItems, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isInitialScrollDone = useRef(false);
  const activeRoomIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeRoomIdRef.current !== activeRoomId) {
      activeRoomIdRef.current = activeRoomId;
      isInitialScrollDone.current = false;
    }
  }, [activeRoomId]);

  useLayoutEffect(() => {
    if (messageGroups.length > 0 && !isInitialScrollDone.current) {
      virtualizer.scrollToIndex(messageGroups.length - 1, { align: "end" });
      isInitialScrollDone.current = true;
    }
  }, [messageGroups.length, virtualizer]);

  const lastMessage = messages[messages.length - 1];
  const lastMessageId = lastMessage?.id;
  const lastMessageIsMe = lastMessage?.isMe;

  useEffect(() => {
    if (!lastMessageId || !isInitialScrollDone.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;

    if (isNearBottom || lastMessageIsMe) {
      requestAnimationFrame(() => {
        virtualizer.scrollToIndex(messageGroups.length - 1, {
          align: "end",
          behavior: lastMessageIsMe ? "auto" : "smooth",
        });
      });
    }
  }, [lastMessageId, lastMessageIsMe, messageGroups.length, virtualizer]);

  useEffect(() => {
    if (typingCount > 0 && isInitialScrollDone.current) {
      const el = scrollContainerRef.current;
      if (el) {
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
        if (isNearBottom) {
          el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
        }
      }
    }
  }, [typingCount]);

  return {
    scrollContainerRef,
    virtualizer,
    virtualItems,
  };
}
