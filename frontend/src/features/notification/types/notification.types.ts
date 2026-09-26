export enum NotificationType {
  NEW_MESSAGE = "NEW_MESSAGE",
  NEW_ROOM = "NEW_ROOM",
  REACTION = "REACTION",
}

export interface NotificationMetadata {
  roomId: string;
  messageId?: string | null;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  senderId: string;
  senderName?: string | null;
  senderAvatar?: string | null;
  type: NotificationType;
  title: string;
  content: string;
  metadata: NotificationMetadata;
  isRead: boolean;
  createdAt: string;
}

export const NOTIFICATION_SOCKET_EVENTS = {
  RECEIVE_NOTIFICATION: "receive:notification",
  NOTIFICATION_READ: "notification:read",
} as const;
