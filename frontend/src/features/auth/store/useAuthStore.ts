import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  getUser: () => User | null;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
  getUser: () => get().user,
}));
