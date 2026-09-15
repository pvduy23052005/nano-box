import { MemberRole, MemberStatus, RoomType } from './chat.enum';

export interface RoomMemberProps {
  userId: string;
  role: MemberRole;
  status: MemberStatus;
}

export interface LastMessageProps {
  id: string;
  content: string | null;
  createdAt: Date | null;
  senderId?: string | null;
}

export interface RoomProps {
  id: string;
  title: string | null;
  typeRoom: RoomType;
  lastMessageId: string | null | LastMessageProps;
  avatar: string | null;
  members: RoomMemberProps[];
}
