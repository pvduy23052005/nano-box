export interface MessageState {
  id?: string;
  senderId: string;
  content: string;
  attachments: string[];
  readBy: string[];
}
