import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  GET_NOTIFICATIONS_QUERY,
  GET_UNREAD_NOTIFICATION_COUNT_QUERY,
  MARK_NOTIFICATION_AS_READ_MUTATION,
} from "../graphql/notification.operations";
import { NotificationItem } from "../types/notification.types";
import {
  NOTIFICATIONS_LIMIT,
  mergeNotificationPages,
  markNotificationAsReadInCache,
} from "../notification.cache";

export interface UseNotificationsOptions {
  enabled?: boolean;
}

export const useNotifications = (options?: UseNotificationsOptions) => {
  const isEnabled = options?.enabled ?? true;
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data: countData } = useQuery(GET_UNREAD_NOTIFICATION_COUNT_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  const { data, loading, fetchMore, refetch } = useQuery(
    GET_NOTIFICATIONS_QUERY,
    {
      variables: { limit: NOTIFICATIONS_LIMIT },
      fetchPolicy: "cache-and-network",
      skip: !isEnabled,
    },
  );

  const [markNotificationAsReadMutation] = useMutation(
    MARK_NOTIFICATION_AS_READ_MUTATION,
  );

  const notifications: NotificationItem[] = useMemo(() => {
    return (data?.getNotifications?.items as NotificationItem[]) || [];
  }, [data?.getNotifications?.items]);

  const unreadCount =
    countData?.getUnreadNotificationCount ??
    data?.getNotifications?.unreadCount ??
    0;

  const hasMore = data?.getNotifications?.hasMore ?? false;
  const nextCursor = data?.getNotifications?.nextCursor;

  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      await fetchMore({
        variables: {
          cursor: nextCursor,
          limit: NOTIFICATIONS_LIMIT,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult?.getNotifications) return prev;

          const prevItems = prev.getNotifications.items || [];
          const newItems = fetchMoreResult.getNotifications.items || [];

          return {
            getNotifications: {
              ...fetchMoreResult.getNotifications,
              items: mergeNotificationPages(prevItems, newItems),
            },
          };
        },
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchMore, hasMore, nextCursor, isLoadingMore]);

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await markNotificationAsReadMutation({
          variables: { id },
          optimisticResponse: {
            markNotificationAsRead: true,
          },
          update: (cache) => {
            markNotificationAsReadInCache(cache, id);
          },
        });
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    },
    [markNotificationAsReadMutation],
  );

  return {
    notifications,
    unreadCount,
    isLoading: isEnabled ? loading : false,
    isLoadingMore,
    hasMore,
    loadMore,
    refetch,
    markAsRead,
  };
};
