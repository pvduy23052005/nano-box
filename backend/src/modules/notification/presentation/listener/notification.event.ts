import { MessageType } from 'src/modules/chat/domain/message.type';

export const NOTIFICATION_EVENTS = {
  MESSAGE_CREATED: 'message.created',
  MESSAGE_REACTION: 'message.reaction',
  MESSAGE_MENTION: 'message.mention',
  ROOM_CREATED: 'room.created',
  FRIEND_REQUEST: 'friend.request',
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
  reactorId: string;
  reactorName?: string;
  reactorAvatar?: string;
  emoji: string;
}

export interface MessageMentionEventPayload {
  message: MessageType;
  mentionedUserIds: string[];
  senderId: string;
  senderName?: string | null;
  senderAvatar?: string | null;
}

export interface FriendRequestEventPayload {
  requesterId: string;
  addresseeId: string;
  friendshipId: string;
  createdAt: Date;
  requesterName: string;
  requesterAvatar?: string | null;
  requesterEmail?: string;
}

export interface RoomCreatedEventPayload {
  roomId: string;
  roomTitle: string;
  creatorId: string;
  creatorName?: string;
  creatorAvatar?: string;
  memberIds: string[];
}
