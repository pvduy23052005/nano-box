import { useEffect } from "react";
import { useSocket } from "@/src/providers/SocketProvider";
import { CHAT_SOCKET_EVENTS } from "../types/event.types";
import { useReadReceiptStore } from "../stores/useReadReceiptStore";

export interface UserReadMessagePayload {
  roomId: string;
  userId: string;
  messageId: string;
}

export const useReceiveMessageRead = () => {
  const { socket } = useSocket();
  const setMemberLastRead = useReadReceiptStore((state) => state.setMemberLastRead);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveRead = (payload: UserReadMessagePayload) => {
      if (!payload?.roomId || !payload?.userId || !payload?.messageId) return;
      setMemberLastRead(payload.roomId, payload.userId, payload.messageId);
    };

    socket.on(CHAT_SOCKET_EVENTS.USER_READ_MESSAGE, handleReceiveRead);

    return () => {
      socket.off(CHAT_SOCKET_EVENTS.USER_READ_MESSAGE, handleReceiveRead);
    };
  }, [socket, setMemberLastRead]);
};
