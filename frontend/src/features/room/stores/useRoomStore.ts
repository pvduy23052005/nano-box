import { create } from "zustand";

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
  members?: Array<{
    userId: string;
    lastReadMessageId?: string | null;
  }> | null;
  avatar: string | null;
}

interface RoomState {
  activeRoomId: string | null;
  activeRoom: ChatRoom | null;
  setActiveRoom: (room: ChatRoom | null) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  activeRoomId: null,
  activeRoom: null,
  setActiveRoom: (room) =>
    set({
      activeRoom: room,
      activeRoomId: room?.id ?? null,
    }),
}));
