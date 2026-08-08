import { useRef, useCallback, useEffect } from "react";
import { useSocket } from "@/src/providers/SocketProvider";
import { CHAT_SOCKET_EVENTS } from "../types/event.types";
import { useAuthStore } from "../../auth/store/useAuthStore";

export const useSendTyping = (timeout = 2000) => {
  const { socket } = useSocket();
  const isTypingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const user = useAuthStore((state) => state.user)

  const stopTyping = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      socket?.emit(CHAT_SOCKET_EVENTS.CLIENT_SEND_TYPING, { isTyping: false, name: user?.name });
    }
  }, [socket , user?.name]);

  const sendTyping = useCallback(() => {
    if (!socket) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit(CHAT_SOCKET_EVENTS.CLIENT_SEND_TYPING, { isTyping: true, name: user?.name });
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit(CHAT_SOCKET_EVENTS.CLIENT_SEND_TYPING, { isTyping: false, name: user?.name });
      timerRef.current = null;
    }, timeout);
  }, [socket, timeout, user?.name]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    sendTyping,
    stopTyping,
  };
};
