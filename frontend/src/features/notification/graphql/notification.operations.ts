import { graphql } from "@/src/types/graphql";

export const GET_NOTIFICATIONS_QUERY = graphql(`
  query GetNotifications($cursor: String, $limit: Float) {
    getNotifications(cursor: $cursor, limit: $limit) {
      items {
        id
        recipientId
        senderId
        senderName
        senderAvatar
        type
        title
        content
        metadata {
          roomId
          messageId
        }
        isRead
        createdAt
      }
      hasMore
      nextCursor
      unreadCount
    }
  }
`);

export const GET_UNREAD_NOTIFICATION_COUNT_QUERY = graphql(`
  query GetUnreadNotificationCount {
    getUnreadNotificationCount
  }
`);

export const MARK_NOTIFICATION_AS_READ_MUTATION = graphql(`
  mutation MarkNotificationAsRead($id: String!) {
    markNotificationAsRead(id: $id)
  }
`);

export const MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION = graphql(`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`);
