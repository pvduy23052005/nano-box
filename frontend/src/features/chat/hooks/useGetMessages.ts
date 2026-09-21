import { useQuery } from "@apollo/client/react";
import { GET_MESSAGE_QUERY } from "../mutation/mutation";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useRoomStore } from "../../room/stores/useRoomStore";
import { Message, PAGINATION_LIMIT } from "../types/chat.types";
import { useCallback, useMemo, useState } from "react";

export const useGetMessages = () => {
  const { user } = useAuthStore();
  const { activeRoomId } = useRoomStore();
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const { data, loading, fetchMore } = useQuery(GET_MESSAGE_QUERY, {
    variables: {
      limit: PAGINATION_LIMIT,
      roomId: activeRoomId!,
    },
    skip: !activeRoomId,
  });

  const messages: Message[] = useMemo(() => {
    if (!activeRoomId) return [];
    const items = data?.getMessages?.items || [];
    return items.map((message) => ({
      ...message,
      roomId: message.roomId || activeRoomId,
      isMe: message.senderId === user?.id,
    }));
  }, [data?.getMessages?.items, user?.id, activeRoomId]);

  const hasNextPage = data?.getMessages?.hasMore ?? false;
  const nextCursor = data?.getMessages?.nextCursor;

  const fetchNextPage = useCallback(async () => {
    if (!hasNextPage || !nextCursor || isFetchingNextPage || !activeRoomId) return;

    setIsFetchingNextPage(true);
    try {
      await fetchMore({
        variables: {
          cursor: nextCursor,
          limit: PAGINATION_LIMIT,
          roomId: activeRoomId,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          return {
            getMessages: {
              ...fetchMoreResult.getMessages,
              items: [
                ...fetchMoreResult.getMessages.items,
                ...prev.getMessages.items,
              ],
            },
          };
        },
      });
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [fetchMore, hasNextPage, nextCursor, isFetchingNextPage, activeRoomId]);

  return {
    messages,
    isLoading: loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};