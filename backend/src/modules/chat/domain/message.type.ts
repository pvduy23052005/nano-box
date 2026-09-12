export interface MessageType {
  id?: string;
  senderId: string;
  roomId: string;
  content: string;
  attachments?: string[];
  readBy?: string[];
}
