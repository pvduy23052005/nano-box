import { useApolloClient } from "@apollo/client/react";
import { useEffect } from "react";
import { useSocket } from "@/src/providers/SocketProvider";
import { GET_MESSAGE_QUERY } from "../services/mutation";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { Message } from "../types";

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

    socket.on('receive:message', handleReceiveMessage);

    return () => {
      socket.off('receive:message', handleReceiveMessage);
    };
  }, [client, socket, user?.id]);
};