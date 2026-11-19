import { useEffect } from "react";
import { useSocket } from "@/src/providers/SocketProvider";
import { CHAT_SOCKET_EVENTS } from "../types/event.types";

export const useChatRoomSubscription = (roomId?: string | null) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit(CHAT_SOCKET_EVENTS.CLIENT_JOIN_ROOM, { roomId });

    const handleReconnect = () => {
      socket.emit(CHAT_SOCKET_EVENTS.CLIENT_JOIN_ROOM, { roomId });
    };

    socket.on("connect", handleReconnect);

    return () => {
      socket.off("connect", handleReconnect);
      socket.emit(CHAT_SOCKET_EVENTS.CLIENT_LEAVE_ROOM, { roomId });
    };
  }, [socket, roomId]);
};
