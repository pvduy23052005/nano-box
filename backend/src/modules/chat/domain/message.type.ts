export interface MessageProps {
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachments: string[];
  readBy: string[];
}
