export interface MessageReactionType {
  emoji: string;
  userIds: string[];
}

export interface MessageType {
  id?: string;
  senderId: string;
  senderAvatar?: string | null;
  senderName?: string | null;
  avatar?: string | null;
  roomId: string;
  content: string;
  attachments?: string[];
  reactions?: MessageReactionType[];
  readBy?: string[];
  isSystem?: boolean;
  createdAt?: Date | string | null;
}
