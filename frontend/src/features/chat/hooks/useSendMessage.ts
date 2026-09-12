import { useMutation, useApolloClient } from "@apollo/client/react";
import { SEND_MESSAGE_MUTATION, GET_MESSAGE_QUERY } from "../services/mutation";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useRoomStore } from "../../room/stores/useRoomStore";
import { appendMessageToCache } from "../utils/chatCache";

export const useSendMessage = () => {
  const { user } = useAuthStore();
  const { activeRoomId } = useRoomStore();
  const client = useApolloClient();
  const [sendMessageMutation] = useMutation(SEND_MESSAGE_MUTATION);

  const sendMessage = (
    content: string,
    tempKeysPromise: Promise<string[]>,
    previewUrls?: string[],
    roomId?: string,
  ) => {
    const targetRoomId = roomId || activeRoomId;
    if (!user || !targetRoomId) return;

    const optimisticId = `temp-${Date.now()}`;

    const optimisticMsg = {
      id: optimisticId,
      content,
      senderId: user.id,
      roomId: targetRoomId,
      attachments: previewUrls ?? [],
      readBy: [],
    };
    appendMessageToCache(client.cache, GET_MESSAGE_QUERY, optimisticMsg);

    (async () => {
      try {
        const tempKeys = await tempKeysPromise;

        await sendMessageMutation({
          variables: {
            input: {
              content,
              roomId: targetRoomId,
              ...(tempKeys.length ? { tempKeys } : {}),
            },
          },
          update: (cache, { data }) => {
            if (!data?.sendMessage) return;
            appendMessageToCache(
              cache,
              GET_MESSAGE_QUERY,
              {
                ...data.sendMessage,
                isMe: data.sendMessage.senderId === user.id,
              },
              optimisticId,
            );
          },
        });
      } catch { }
    })();
  };

  return { sendMessage };
};

