import { useRef, useCallback, useEffect } from "react";
import { useSocket } from "@/src/providers/SocketProvider";
import { CHAT_SOCKET_EVENTS } from "../types/event.types";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useRoomStore } from "../../room/stores/useRoomStore";

export const useSendTyping = (roomId?: string, timeout = 2000) => {
  const { socket } = useSocket();
  const activeRoomId = useRoomStore((state) => state.activeRoomId);
  const targetRoomId = roomId ?? activeRoomId;

  const isTypingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentRoomIdRef = useRef<string | null>(targetRoomId ?? null);
  const user = useAuthStore((state) => state.user);
  const userAvatar = user?.avatar || "/images/default-avatar.webp";

  useEffect(() => {
    if (
      currentRoomIdRef.current &&
      currentRoomIdRef.current !== targetRoomId &&
      isTypingRef.current
    ) {
      socket?.emit(CHAT_SOCKET_EVENTS.CLIENT_SEND_TYPING, {
        roomId: currentRoomIdRef.current,
        isTyping: false,
        name: user?.name,
        avatar: userAvatar,
      });
      isTypingRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
    currentRoomIdRef.current = targetRoomId ?? null;
  }, [targetRoomId, socket, user?.name, userAvatar]);

  const stopTyping = useCallback(
    (overrideRoomId?: string) => {
      const room = overrideRoomId ?? currentRoomIdRef.current;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (isTypingRef.current && room) {
        isTypingRef.current = false;
        socket?.emit(CHAT_SOCKET_EVENTS.CLIENT_SEND_TYPING, {
          roomId: room,
          isTyping: false,
          name: user?.name,
          avatar: userAvatar,
        });
      }
    },
    [socket, user?.name, userAvatar],
  );

  const sendTyping = useCallback(
    (overrideRoomId?: string) => {
      const room = overrideRoomId ?? currentRoomIdRef.current;
      if (!socket || !room) return;

      if (!isTypingRef.current) {
        isTypingRef.current = true;
        socket.emit(CHAT_SOCKET_EVENTS.CLIENT_SEND_TYPING, {
          roomId: room,
          isTyping: true,
          name: user?.name,
          avatar: userAvatar,
        });
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        isTypingRef.current = false;
        socket.emit(CHAT_SOCKET_EVENTS.CLIENT_SEND_TYPING, {
          roomId: room,
          isTyping: false,
          name: user?.name,
          avatar: userAvatar,
        });
        timerRef.current = null;
      }, timeout);
    },
    [socket, timeout, user?.name, userAvatar],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (isTypingRef.current && currentRoomIdRef.current) {
        socket?.emit(CHAT_SOCKET_EVENTS.CLIENT_SEND_TYPING, {
          roomId: currentRoomIdRef.current,
          isTyping: false,
          name: user?.name,
          avatar: userAvatar,
        });
        isTypingRef.current = false;
      }
    };
  }, [socket, user?.name, userAvatar]);

  return {
    sendTyping,
    stopTyping,
  };
};
