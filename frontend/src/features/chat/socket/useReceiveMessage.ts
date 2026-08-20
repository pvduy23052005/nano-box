import { useEffect } from "react";
import { useApolloClient } from "@apollo/client/react";
import { useSocket } from "@/src/providers/SocketProvider";
import { GET_MESSAGE_QUERY } from "../services/mutation";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { Message } from "../types/chat.types";
import { CHAT_SOCKET_EVENTS } from "../types/event.types";
import { appendMessageToCache } from "../utils/chatCache";

export const useReceiveMessage = () => {
  const client = useApolloClient();
  const { socket } = useSocket();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage: Message) => {

      if (newMessage.senderId === user?.id) return;

      appendMessageToCache(client.cache, GET_MESSAGE_QUERY, newMessage);
    };

    socket.on(CHAT_SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);

    return () => {
      socket.off(CHAT_SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
    };
  }, [client, socket, user?.id]);
};
