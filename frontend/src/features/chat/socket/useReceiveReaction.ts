import { useEffect } from "react";
import { useApolloClient } from "@apollo/client/react";
import { useSocket } from "@/src/providers/SocketProvider";
import { GET_MESSAGE_QUERY } from "../mutation/mutation";
import { Message } from "../types/chat.types";
import { CHAT_SOCKET_EVENTS } from "../types/event.types";
import { updateMessageReactionInCache } from "../utils/chatCache";

export const useReceiveReaction = () => {
  const client = useApolloClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleUpdateReaction = (updatedMessage: Message) => {
      if (!updatedMessage?.id || !updatedMessage?.roomId) return;

      updateMessageReactionInCache(
        client.cache,
        GET_MESSAGE_QUERY,
        updatedMessage.roomId,
        updatedMessage.id,
        updatedMessage.reactions,
      );
    };

    socket.on(CHAT_SOCKET_EVENTS.UPDATE_MESSAGE_REACTION, handleUpdateReaction);

    return () => {
      socket.off(
        CHAT_SOCKET_EVENTS.UPDATE_MESSAGE_REACTION,
        handleUpdateReaction,
      );
    };
  }, [client, socket]);
};
