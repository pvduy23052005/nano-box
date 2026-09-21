export interface MessageReactionType {
  emoji: string;
  userIds: string[];
}

export interface MessageType {
  id?: string;
  senderId: string;
  roomId: string;
  content: string;
  attachments?: string[];
  reactions?: MessageReactionType[];
  readBy?: string[];
}
