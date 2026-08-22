export interface Message {
  id: string;
  content: string;
  senderId: string;
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