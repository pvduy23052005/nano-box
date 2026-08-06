import { useQuery } from "@apollo/client/react";
import { GET_MESSAGE_QUERY } from "../services/mutation";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { Message } from "../types/chat.types";

export const useGetMessages = () => {
  const { user } = useAuthStore();
  const { data, loading } = useQuery(GET_MESSAGE_QUERY);

  const messages: Message[] =
    data?.getMessages?.map((message) => ({
      ...message,
      isMe: message.senderId === user?.id,
    })) || [];

  return {
    messages,
    isLoading: loading,
  };
};