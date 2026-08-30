import { RoomType } from './chat.enum';
import { RoomMember } from './member.object';


export interface RoomProps {
  id: string;
  title: string | null;
  typeRoom: RoomType;
  lastMessageid: string | null;
  avatar: string | null;
  members: RoomMember[];
}
