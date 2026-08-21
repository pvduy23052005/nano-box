import { useMutation } from "@apollo/client/react";
import { SEND_MESSAGE_MUTATION, GET_MESSAGE_QUERY } from "../services/mutation";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { appendMessageToCache } from "../utils/chatCache";

export const useSendMessage = () => {
  const { user } = useAuthStore();
  const [sendMessageMutation, { loading, error }] = useMutation(SEND_MESSAGE_MUTATION);

  const sendMessage = async (content: string) => {
    if (!user) return;

    const optimisticId = `temp-${Date.now()}`;

    try {
      await sendMessageMutation({
        variables: {
          input: {
            content,
          }
        },
        optimisticResponse: {
          sendMessage: {
            id: optimisticId,
            content,
            senderId: user.id,
            attachments: [],
          }
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
            optimisticId
          );
        }
      });
    } catch {}
  };

  return {
    sendMessage,
    isSending: loading,
    error,
  };
};
