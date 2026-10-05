export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  roomId: string;
  avatar?: string | null;
  senderAvatar?: string | null;
  senderName?: string | null;
  isMe: boolean;
  attachments?: string[] | null;
  readBy?: string[] | null;
  reactions?: MessageReaction[] | null;
  createdAt?: string | Date;
}

export interface MessageGroup {
  id: string;
  isMe: boolean;
  senderId: string;
  avatar?: string | null;
  senderAvatar?: string | null;
  senderName?: string | null;
  messages: Message[];
}

export interface GetMessageInput {
  cursor: string;
  limit: number;
};

export interface GetMessagesResponse {
  items: readonly Message[];
  hasMore: boolean;
  nextCursor: string | null;
}

export const PAGINATION_LIMIT = 10;

export type TypingPayload = {
  roomId: string;
  userId: string;
  name?: string;
  avatar?: string;
  isTyping: boolean;
};
