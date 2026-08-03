export interface MessageType {
  id?: string;
  senderId: string;
  content: string;
  attachments?: string[];
  readBy?: string[];
}
