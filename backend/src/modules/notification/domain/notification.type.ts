export enum NotificationType {
  NEW_MESSAGE = 'NEW_MESSAGE',
  REACTION = 'REACTION',
  NEW_ROOM = 'NEW_ROOM',
}

export interface NotificationMetadata {
  roomId: string;
  messageId?: string;
}

export interface NotificationProps {
  id?: string;
  recipientId: string;
  senderId: string;
  type: NotificationType;
  title: string;
  content: string;
  metadata: NotificationMetadata;
  isRead: boolean;
  createdAt?: Date;
}
