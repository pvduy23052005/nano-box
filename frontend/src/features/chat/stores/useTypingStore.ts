import { create } from "zustand";

export interface TypingUser {
  userIdTyping: string;
  nameTyping?: string;
  avatarTyping?: string;
}

interface TypingState {
  typingByRoom: Record<string, Record<string, TypingUser>>;
  setTyping: (
    roomId: string,
    userIdTyping: string,
    isTyping: boolean,
    nameTyping?: string,
    avatarTyping?: string,
  ) => void;
  clearRoomTyping: (roomId: string) => void;
  clearAllTyping: () => void;
}

export const useTypingStore = create<TypingState>((set) => ({
  typingByRoom: {},
  setTyping: (roomId, userIdTyping, isTyping, nameTyping, avatarTyping) =>
    set((state) => {
      const roomTyping = { ...(state.typingByRoom[roomId] || {}) };
      if (isTyping) {
        roomTyping[userIdTyping] = { userIdTyping, nameTyping, avatarTyping };
      } else {
        delete roomTyping[userIdTyping];
      }
      return {
        typingByRoom: {
          ...state.typingByRoom,
          [roomId]: roomTyping,
        },
      };
    }),
  clearRoomTyping: (roomId) =>
    set((state) => {
      if (!state.typingByRoom[roomId]) return state;
      const next = { ...state.typingByRoom };
      delete next[roomId];
      return { typingByRoom: next };
    }),
  clearAllTyping: () => set({ typingByRoom: {} }),
}));
