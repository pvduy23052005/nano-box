import { useEffect } from "react";
import { useApolloClient } from "@apollo/client/react";
import { useSocket } from "@/src/providers/SocketProvider";
import { GET_MESSAGE_QUERY } from "../mutation/mutation";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { Message } from "../types/chat.types";
import { CHAT_SOCKET_EVENTS } from "../types/event.types";
import { appendMessageToCache } from "../utils/chatCache";
import { updateRoomLastMessageInCache } from "../../room/room.cache";

export const useReceiveMessage = () => {
  const client = useApolloClient();
  const { socket } = useSocket();
  const currentUserId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage: Message) => {
      if (newMessage.senderId === currentUserId) return;

      appendMessageToCache(client.cache, GET_MESSAGE_QUERY, {
        ...newMessage,
        isMe: newMessage.senderId === currentUserId,
        isSystem: newMessage.isSystem ?? (newMessage.senderId === "system"),
      });

      if (newMessage.roomId) {
        updateRoomLastMessageInCache(client.cache, newMessage.roomId, {
          id: newMessage.id,
          content: newMessage.content,
          senderId: newMessage.senderId,
          createdAt: newMessage.createdAt || new Date().toISOString(),
        });
      }
    };

    socket.on(CHAT_SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);

    return () => {
      socket.off(CHAT_SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
    };
  }, [client, socket, currentUserId]);
};
