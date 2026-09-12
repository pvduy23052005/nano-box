export interface Message {
  id: string;
  content: string;
  senderId: string;
  roomId?: string | null;
  avatar?: string;
  isMe: boolean;
  attachments?: string[] | null;
  readBy?: string[] | null;
}

export interface MessageGroup {
  id: string;
  isMe: boolean;
  senderId: string;
  avatar?: string;
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
  userId: string;
  name: string;
  isTyping: boolean;
};
