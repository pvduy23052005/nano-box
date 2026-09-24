import { MessageType } from 'src/modules/chat/domain/message.type';

export const NOTIFICATION_EVENTS = {
  MESSAGE_CREATED: 'message.created',
  MESSAGE_REACTION: 'message.reaction',
  ROOM_CREATED: 'room.created',
} as const;

export const NOTIFICATION_SOCKET_EVENTS = {
  RECEIVE_NOTIFICATION: 'receive:notification',
  NOTIFICATION_READ: 'notification:read',
} as const;

export interface MessageCreatedEventPayload {
  message: MessageType;
  memberIds: string[];
  senderName?: string;
}

export interface MessageReactionEventPayload {
  message: MessageType;
  memberIds: string[];
  userId: string;
  emoji: string;
}
