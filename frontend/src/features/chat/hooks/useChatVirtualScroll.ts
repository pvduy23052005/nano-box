import { useEffect, useRef, useLayoutEffect, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Message, MessageGroup } from "../types/chat.types";
import {
  shouldFetchOlderMessages,
  shouldAutoScrollOnNewMessage,
} from "../utils/chatScroll.util";

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
  const prevLastMessageIdRef = useRef<string | undefined>(undefined);

  const virtualizer = useVirtualizer({
    count: messageGroups.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 80,
    getItemKey: (index) => messageGroups[index]?.id ?? index,
    anchorTo: "end",
    gap: 16,
    paddingStart: 12,
    paddingEnd: 20,
    overscan: 6,
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    if (activeRoomIdRef.current !== activeRoomId) {
      activeRoomIdRef.current = activeRoomId;
      isInitialScrollDone.current = false;
      isFetchingLockRef.current = false;
      prevLastMessageIdRef.current = undefined;
    }
  }, [activeRoomId]);

  // Trigger loading older messages when condition met
  const triggerFetchOlder = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const firstItem = virtualItems[0];
    const shouldFetch = shouldFetchOlderMessages({
      isInitialScrollDone: isInitialScrollDone.current,
      hasNextPage,
      isFetchingNextPage,
      isFetchingLocked: isFetchingLockRef.current,
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      firstVisibleIndex: firstItem?.index ?? 0,
      topThreshold: 80,
    });

    if (shouldFetch) {
      isFetchingLockRef.current = true;

      Promise.resolve(fetchNextPage()).finally(() => {
        setTimeout(() => {
          isFetchingLockRef.current = false;
        }, 300);
      });
    }
  }, [virtualItems, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    triggerFetchOlder();
  }, [triggerFetchOlder]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => {
      triggerFetchOlder();
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [triggerFetchOlder]);

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
      prevLastMessageIdRef.current = messages[messages.length - 1]?.id;
    }
  }, [messageGroups.length, messages, virtualizer]);

  const lastMessage = messages[messages.length - 1];
  const lastMessageId = lastMessage?.id;
  const lastMessageIsMe = Boolean(lastMessage?.isMe);

  useEffect(() => {
    if (!lastMessageId || !isInitialScrollDone.current) return;

    const isNewMessageAppended =
      prevLastMessageIdRef.current !== undefined &&
      lastMessageId !== prevLastMessageIdRef.current;

    prevLastMessageIdRef.current = lastMessageId;

    const el = scrollContainerRef.current;
    if (!el) return;

    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 150;

    const shouldScroll = shouldAutoScrollOnNewMessage({
      isNewMessageAppended,
      isNearBottom,
      isMessageFromMe: lastMessageIsMe,
    });

    if (shouldScroll) {
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

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [lastMessageId, lastMessageIsMe, messageGroups.length, virtualizer]);

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
