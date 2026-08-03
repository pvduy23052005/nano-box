import { useMutation } from "@apollo/client/react";
import { SEND_MESSAGE_MUTATION, GET_MESSAGE_QUERY } from "../services/mutation";
import { useAuthStore } from "../../auth/store/useAuthStore";

export const useSendMessage = () => {
  const { user } = useAuthStore();
  const [sendMessageMutation, { loading, error }] = useMutation(SEND_MESSAGE_MUTATION);

  const sendMessage = async (content: string) => {
    if (!user) return;

    try {
      await sendMessageMutation({
        variables: {
          input: {
            content,
          }
        },
        optimisticResponse: {
          sendMessage: {
            id: `temp-${Date.now()}`,
            content,
            senderId: user.id,
            attachments: [],
          }
        },
        update: (cache, { data }) => {
          if (!data?.sendMessage) return;

          const existingData = cache.readQuery({
            query: GET_MESSAGE_QUERY,
          });

          if (existingData && existingData.getMessages) {
            cache.writeQuery({
              query: GET_MESSAGE_QUERY,
              data: {
                getMessages: [...existingData.getMessages, data.sendMessage],
              }
            });
          }
        }
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return {
    sendMessage,
    isSending: loading,
    error,
  };
};
