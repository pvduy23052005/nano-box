import { useQuery } from "@apollo/client/react";
import { GET_MESSAGE_QUERY } from "../services/mutation";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { Message } from "../types/chat.types";
import { useCallback, useMemo, useState } from "react";

export const useGetMessages = () => {
  const { user } = useAuthStore();
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const { data, loading, fetchMore } = useQuery(GET_MESSAGE_QUERY, {
    variables: { limit: 10 },
  });

  const messages: Message[] = useMemo(() => {
    const items = data?.getMessages?.items || [];
    return items.map((message) => ({
      ...message,
      isMe: message.senderId === user?.id,
    }));
  }, [data?.getMessages?.items, user?.id]);

  const hasNextPage = data?.getMessages?.hasMore ?? false;
  const nextCursor = data?.getMessages?.nextCursor;

  const fetchNextPage = useCallback(async () => {
    if (!hasNextPage || !nextCursor || isFetchingNextPage) return;

    setIsFetchingNextPage(true);
    try {
      await fetchMore({
        variables: {
          cursor: nextCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          return {
            getMessages: {
              ...fetchMoreResult.getMessages,
              items: [
                ...prev.getMessages.items,
                ...fetchMoreResult.getMessages.items,
              ],
            },
          };
        },
      });
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [fetchMore, hasNextPage, nextCursor, isFetchingNextPage]);

  return {
    messages,
    isLoading: loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};