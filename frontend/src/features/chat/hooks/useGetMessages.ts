import { useQuery } from "@apollo/client/react";
import { GET_MESSAGE_QUERY } from "../services/mutation";
import { useAuthStore } from "../../auth/store/useAuthStore";

export const useGetMessages = () => {
  const { user } = useAuthStore();
  const { data, loading } = useQuery(GET_MESSAGE_QUERY);

  const messages = data?.getMessages?.map((message) => ({
    ...message,
    isMe: message.senderId === user?.id
  }));

  return {
    messages: messages || [],
    isLoading: loading
  }
}