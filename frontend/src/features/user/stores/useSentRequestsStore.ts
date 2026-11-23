import { create } from "zustand";

export interface SentFriendRequestItem {
  id: string;
  name: string;
  email?: string;
  avatar?: string | null;
  sentAt: Date;
}

interface SentRequestsState {
  sentRequests: SentFriendRequestItem[];
  addSentRequest: (user: {
    id: string;
    name: string;
    email?: string;
    avatar?: string | null;
  }) => void;
  removeSentRequest: (userId: string) => void;
  isSent: (userId: string) => boolean;
}

export const useSentRequestsStore = create<SentRequestsState>((set, get) => ({
  sentRequests: [],
  addSentRequest: (user) => {
    set((state) => {
      const isAlreadySent = state.sentRequests.some(
        (request) => request.id === user.id
      );

      if (isAlreadySent) {
        return state;
      }

      return {
        sentRequests: [
          {
            ...user,
            sentAt: new Date(),
          },
          ...state.sentRequests,
        ],
      };
    });
  },
  removeSentRequest: (userId) => {
    set((state) => ({
      sentRequests: state.sentRequests.filter(
        (request) => request.id !== userId
      ),
    }));
  },
  isSent: (userId) => {
    return get().sentRequests.some((request) => request.id === userId);
  },
}));
