import { useMutation, useApolloClient } from "@apollo/client/react";
import { SEND_MESSAGE_MUTATION, GET_MESSAGE_QUERY } from "../services/mutation";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { appendMessageToCache } from "../utils/chatCache";

export const useSendMessage = () => {
  const { user } = useAuthStore();
  const client = useApolloClient();
  const [sendMessageMutation] = useMutation(SEND_MESSAGE_MUTATION);

  const sendMessage = (
    content: string,
    tempKeysPromise: Promise<string[]>,
    previewUrls?: string[],
  ) => {
    if (!user) return;

    const optimisticId = `temp-${Date.now()}`;

    const optimisticMsg = {
      id: optimisticId,
      content,
      senderId: user.id,
      attachments: previewUrls ?? [],
    };
    appendMessageToCache(client.cache, GET_MESSAGE_QUERY, optimisticMsg);

    (async () => {
      try {
        const tempKeys = await tempKeysPromise;

        await sendMessageMutation({
          variables: {
            input: {
              content,
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

