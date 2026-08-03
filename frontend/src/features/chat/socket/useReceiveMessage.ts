import { useEffect } from "react";
import { useApolloClient } from "@apollo/client/react";
import { useSocket } from "@/src/providers/SocketProvider";
import { GET_MESSAGE_QUERY } from "../services/mutation";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { Message } from "../types/chat.types";
import { CHAT_SOCKET_EVENTS } from "../types/event.types";

export const useReceiveMessage = () => {
  const client = useApolloClient();
  const { socket } = useSocket();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage: Message) => {
      if (newMessage.senderId === user?.id) return;

      const existingData = client.cache.readQuery({
        query: GET_MESSAGE_QUERY,
      });

      if (existingData && existingData.getMessages) {
        const messageExists = existingData.getMessages.some(
          (msg: Message) => msg.id === newMessage.id
        );

        if (!messageExists) {
          client.cache.writeQuery({
            query: GET_MESSAGE_QUERY,
            data: {
              getMessages: [...existingData.getMessages, newMessage],
            },
          });
        }
      }
    };

    socket.on(CHAT_SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);

    return () => {
      socket.off(CHAT_SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
    };
  }, [client, socket, user?.id]);
};