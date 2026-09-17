import { useEffect, useRef } from "react";
import { useSocket } from "@/src/providers/SocketProvider";
import { CHAT_SOCKET_EVENTS } from "../types/event.types";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useTypingStore } from "../stores/useTypingStore";
import { TypingPayload } from "../types/chat.types";

export const useReceiveTyping = () => {
  const { socket } = useSocket();
  const { user } = useAuthStore();
  const { setTyping } = useTypingStore();
  const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    if (!socket) return;

    const handleReceiveTyping = (payload: TypingPayload) => {
      if (!payload.userId || payload.userId === user?.id || !payload.roomId)
        return;

      const timerKey = `${payload.roomId}:${payload.userId}`;

      if (timeoutsRef.current[timerKey]) {
        clearTimeout(timeoutsRef.current[timerKey]);
        delete timeoutsRef.current[timerKey];
      }

      setTyping(
        payload.roomId,
        payload.userId,
        payload.isTyping,
        payload.name,
        payload.avatar,
      );

      if (payload.isTyping) {
        timeoutsRef.current[timerKey] = setTimeout(() => {
          setTyping(payload.roomId, payload.userId, false);
          delete timeoutsRef.current[timerKey];
        }, 3500);
      }
    };

    socket.on(CHAT_SOCKET_EVENTS.SERVER_SEND_TYPING, handleReceiveTyping);

    return () => {
      socket.off(CHAT_SOCKET_EVENTS.SERVER_SEND_TYPING, handleReceiveTyping);
      Object.values(timeoutsRef.current).forEach(clearTimeout);
      timeoutsRef.current = {};
    };
  }, [socket, user?.id, setTyping]);
};
