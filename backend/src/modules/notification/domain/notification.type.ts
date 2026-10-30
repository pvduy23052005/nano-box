export enum NotificationType {
  NEW_MESSAGE = 'NEW_MESSAGE',
  REACTION = 'REACTION',
  NEW_ROOM = 'NEW_ROOM',
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  ROOM_ACTION = 'ROOM_ACTION',
  MENTION = 'MENTION',
}

export interface NotificationMetadata {
  roomId?: string;
  messageId?: string;
  action?: string;
}

export interface NotificationProps {
  id?: string;
  recipientId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  type: NotificationType;
  title: string;
  content: string;
  metadata: NotificationMetadata;
  isRead: boolean;
  createdAt?: Date;
}
