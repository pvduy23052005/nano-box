import { ApolloCache } from "@apollo/client";
import {
  GET_NOTIFICATIONS_QUERY,
  GET_UNREAD_NOTIFICATION_COUNT_QUERY,
} from "./graphql/notification.operations";
import {
  GetNotificationsQuery,
  GetNotificationsQueryVariables,
  GetUnreadNotificationCountQuery,
} from "@/src/types/graphql/graphql";
import { NotificationItem } from "./types/notification.types";

export const NOTIFICATIONS_LIMIT = 20;

export type NotificationCacheItem =
  GetNotificationsQuery["getNotifications"]["items"][number];

export const mergeNotificationPages = <T extends { id: string }>(
  prevItems: T[],
  newItems: T[],
): T[] => {
  const existingIds = new Set(prevItems.map((item) => item.id));
  const uniqueNewItems = newItems.filter((item) => !existingIds.has(item.id));
  return [...prevItems, ...uniqueNewItems];
};

export const incrementUnreadCountInCache = (cache: ApolloCache): void => {
  try {
    const existing = cache.readQuery<GetUnreadNotificationCountQuery>({
      query: GET_UNREAD_NOTIFICATION_COUNT_QUERY,
    });

    const newCount = (existing?.getUnreadNotificationCount ?? 0) + 1;

    cache.writeQuery<GetUnreadNotificationCountQuery>({
      query: GET_UNREAD_NOTIFICATION_COUNT_QUERY,
      data: {
        getUnreadNotificationCount: newCount,
      },
    });
  } catch (error) {
    console.warn("Could not increment unread count in cache:", error);
  }
};

export const decrementUnreadCountInCache = (
  cache: ApolloCache,
  amount = 1,
): void => {
  try {
    const existing = cache.readQuery<GetUnreadNotificationCountQuery>({
      query: GET_UNREAD_NOTIFICATION_COUNT_QUERY,
    });

    if (existing?.getUnreadNotificationCount !== undefined) {
      const newCount = Math.max(0, existing.getUnreadNotificationCount - amount);
      cache.writeQuery<GetUnreadNotificationCountQuery>({
        query: GET_UNREAD_NOTIFICATION_COUNT_QUERY,
        data: {
          getUnreadNotificationCount: newCount,
        },
      });
    }
  } catch (error) {
    console.warn("Could not decrement unread count in cache:", error);
  }
};

export const resetUnreadCountInCache = (cache: ApolloCache): void => {
  try {
    cache.writeQuery<GetUnreadNotificationCountQuery>({
      query: GET_UNREAD_NOTIFICATION_COUNT_QUERY,
      data: {
        getUnreadNotificationCount: 0,
      },
    });
  } catch (error) {
    console.warn("Could not reset unread count in cache:", error);
  }
};

export const appendNotificationToCache = (
  cache: ApolloCache,
  newNotification: NotificationItem,
  limit = NOTIFICATIONS_LIMIT,
): void => {
  const itemToAdd: NotificationCacheItem = {
    ...newNotification,
    senderName: newNotification.senderName ?? null,
    senderAvatar: newNotification.senderAvatar ?? null,
    isRead: newNotification.isRead ?? false,
    createdAt: newNotification.createdAt ?? new Date().toISOString(),
    metadata: {
      roomId: newNotification.metadata?.roomId ?? "",
      messageId: newNotification.metadata?.messageId ?? null,
    },
  };

  try {
    cache.updateQuery<GetNotificationsQuery, GetNotificationsQueryVariables>(
      {
        query: GET_NOTIFICATIONS_QUERY,
        variables: { limit },
      },
      (data) => {
        if (!data?.getNotifications) return data;

        const currentItems = data.getNotifications.items || [];
        const exists = currentItems.some(
          (item) => item.id === newNotification.id,
        );
        if (exists) return data;

        return {
          getNotifications: {
            ...data.getNotifications,
            unreadCount: (data.getNotifications.unreadCount ?? 0) + 1,
            items: [itemToAdd, ...currentItems],
          },
        };
      },
    );
  } catch (error) {
    console.warn(
      "Could not append notification to GET_NOTIFICATIONS_QUERY cache:",
      error,
    );
  }

  incrementUnreadCountInCache(cache);
};
