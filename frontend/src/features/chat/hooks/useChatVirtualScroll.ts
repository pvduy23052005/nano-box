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
  const isInitialScrollDone = useRef(false);
  const activeRoomIdRef = useRef<string | null>(null);
  const isFetchingLockRef = useRef(false);
  const prevScrollHeightRef = useRef(0);
  const prevScrollTopRef = useRef(0);

  const virtualizer = useVirtualizer({
    count: messageGroups.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 80,
    getItemKey: (index) => messageGroups[index]?.id ?? index,
    anchorTo: "end",
    followOnAppend: true,
    scrollEndThreshold: 150,
    gap: 16,
    paddingStart: 12,
    paddingEnd: 16,
    overscan: 6,
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    if (activeRoomIdRef.current !== activeRoomId) {
      activeRoomIdRef.current = activeRoomId;
      isInitialScrollDone.current = false;
      isFetchingLockRef.current = false;
      prevScrollHeightRef.current = 0;
      prevScrollTopRef.current = 0;
    }
  }, [activeRoomId]);

  useEffect(() => {
    if (!isInitialScrollDone.current || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const el = scrollContainerRef.current;
    if (!el) return;

    const isNearTop = el.scrollTop <= 120 && el.scrollHeight > el.clientHeight;
    const firstItem = virtualItems[0];

    if (
      firstItem &&
      firstItem.index <= 1 &&
      isNearTop &&
      !isFetchingLockRef.current
    ) {
      isFetchingLockRef.current = true;
      prevScrollHeightRef.current = el.scrollHeight;
      prevScrollTopRef.current = el.scrollTop;

      Promise.resolve(fetchNextPage()).finally(() => {
        setTimeout(() => {
          isFetchingLockRef.current = false;
        }, 400);
      });
    }
  }, [virtualItems, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || prevScrollHeightRef.current === 0) return;

    const heightDiff = el.scrollHeight - prevScrollHeightRef.current;
    if (heightDiff > 0) {
      el.scrollTop = prevScrollTopRef.current + heightDiff;
      prevScrollHeightRef.current = 0;
    }
  }, [messageGroups.length]);

  useLayoutEffect(() => {
    if (messageGroups.length > 0 && !isInitialScrollDone.current) {
      const el = scrollContainerRef.current;
      virtualizer.scrollToIndex(messageGroups.length - 1, { align: "end" });
      if (el) {
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight;
        });
      }
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
    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 150;

    if (isNearBottom || lastMessageIsMe) {
      const scrollDown = (behavior: ScrollBehavior = "auto") => {
        if (!el) return;
        virtualizer.scrollToIndex(messageGroups.length - 1, {
          align: "end",
          behavior,
        });
        requestAnimationFrame(() => {
          if (el) {
            el.scrollTop = el.scrollHeight;
          }
        });
      };

      const behavior = lastMessageIsMe ? "auto" : "smooth";
      scrollDown(behavior);

      const timer1 = setTimeout(() => scrollDown(behavior), 50);
      const timer2 = setTimeout(() => scrollDown(behavior), 150);
      const timer3 = setTimeout(() => scrollDown(behavior), 300);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [lastMessageId, lastMessageIsMe, messageGroups.length, virtualizer]);

  const totalSize = virtualizer.getTotalSize();
  const prevTotalSizeRef = useRef(totalSize);

  useEffect(() => {
    if (!isInitialScrollDone.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;

    if (totalSize !== prevTotalSizeRef.current) {
      prevTotalSizeRef.current = totalSize;
      const isNearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 150;
      if (isNearBottom || lastMessageIsMe) {
        requestAnimationFrame(() => {
          if (el) {
            el.scrollTop = el.scrollHeight;
          }
        });
      }
    }
  }, [totalSize, lastMessageIsMe]);

  useEffect(() => {
    if (typingCount > 0 && isInitialScrollDone.current) {
      const el = scrollContainerRef.current;
      if (el) {
        const isNearBottom =
          el.scrollHeight - el.scrollTop - el.clientHeight < 150;
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
