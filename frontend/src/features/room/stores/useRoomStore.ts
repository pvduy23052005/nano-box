import { create } from "zustand";

export interface ChatRoomMember {
  userId: string;
  name?: string | null;
  avatar?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null;
  lastReadMessageId?: string | null;
  user?: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  } | null;
}

export interface ChatRoom {
  id: string;
  title: string | null;
  typeRoom: string;
  lastMessageId?: {
    id?: string | null;
    content?: string | null;
    senderId?: string | null;
    createdAt?: unknown;
  } | string | null;
  members?: ChatRoomMember[] | null;
  avatar: string | null;
  groupAvatars?: (string | null)[] | null;
}

interface RoomState {
  activeRoomId: string | null;
  activeRoom: ChatRoom | null;
  isCreateGroupOpen: boolean;
  setActiveRoom: (room: ChatRoom | null) => void;
  setActiveRoomId: (roomId: string | null) => void;
  setIsCreateGroupOpen: (open: boolean) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  activeRoomId: null,
  activeRoom: null,
  isCreateGroupOpen: false,
  setActiveRoom: (room) =>
    set({
      activeRoom: room,
      activeRoomId: room?.id ?? null,
    }),
  setActiveRoomId: (roomId) =>
    set({
      activeRoomId: roomId,
    }),
  setIsCreateGroupOpen: (open) =>
    set({
      isCreateGroupOpen: open,
    }),
}));
