import { MemberRole, MemberStatus, RoomType } from './chat.enum';

export interface RoomMemberProps {
  userId: string;
  role: MemberRole;
  status: MemberStatus;
}

export interface RoomProps {
  id: string;
  title: string | null;
  typeRoom: RoomType;
  lastMessageId: string | null;
  avatar: string | null;
  members: RoomMemberProps[];
}
