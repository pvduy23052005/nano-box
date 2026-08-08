import { create } from "zustand";

export interface TypingUser {
  userId: string;
  name?: string;
}

interface TypingState {
  typingUsers: Record<string, TypingUser>;
  setTyping: (userId: string, isTyping: boolean, name?: string) => void;
  clearTyping: () => void;
}

export const useTypingStore = create<TypingState>((set) => ({
  typingUsers: {},
  setTyping: (userId, isTyping, name) =>
    set((state) => {
      const next = { ...state.typingUsers };
      if (isTyping) {
        next[userId] = { userId, name };
      } else {
        delete next[userId];
      }
      return { typingUsers: next };
    }),
  clearTyping: () => set({ typingUsers: {} }),
}));
