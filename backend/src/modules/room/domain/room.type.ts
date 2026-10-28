import { MemberRole, MemberStatus, RoomType } from './chat.enum';

export const MAX_GROUP_MEMBERS = 100;

export interface RoomMemberProps {
  userId: string;
  role: MemberRole;
  status: MemberStatus;
  lastReadMessageId?: string | null;
  name?: string | null;
  avatar?: string | null;
  email?: string | null;
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
  groupAvatars?: string[] | null;
  version?: number;
}
