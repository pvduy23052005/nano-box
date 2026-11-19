import { create } from "zustand";

interface PresenceState {
  onlineUsers: Record<string, boolean>;
  setInitialOnlineUsers: (userIds: string[]) => void;
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  isUserOnline: (userId?: string | null) => boolean;
  getOnlineCount: (userIds: string[]) => number;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUsers: {},

  setInitialOnlineUsers: (userIds) => {
    const nextMap: Record<string, boolean> = {};
    for (const id of userIds) {
      if (id) {
        nextMap[id] = true;
      }
    }
    set({ onlineUsers: nextMap });
  },

  setUserOnline: (userId) => {
    if (!userId) return;
    set((state) => {
      if (state.onlineUsers[userId]) return state;
      return {
        onlineUsers: {
          ...state.onlineUsers,
          [userId]: true,
        },
      };
    });
  },

  setUserOffline: (userId) => {
    if (!userId) return;
    set((state) => {
      if (!state.onlineUsers[userId]) return state;
      const nextMap = { ...state.onlineUsers };
      delete nextMap[userId];
      return { onlineUsers: nextMap };
    });
  },

  isUserOnline: (userId) => {
    if (!userId) return false;
    return !!get().onlineUsers[userId];
  },

  getOnlineCount: (userIds) => {
    const currentOnline = get().onlineUsers;
    return userIds.reduce((count, id) => {
      return id && currentOnline[id] ? count + 1 : count;
    }, 0);
  },
}));
