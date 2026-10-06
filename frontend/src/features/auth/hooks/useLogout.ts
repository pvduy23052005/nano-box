"use client";

import { useState } from "react";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { LOGOUT_MUTATION } from "../services/mutations";
import { useAuthStore } from "../store/useAuthStore";
import { logoutAction } from "../actions/logout.action";
import { useSocket, disconnectSocket } from "@/src/providers/SocketProvider";
import { PRESENCE_SOCKET_EVENTS } from "@/src/features/user/types/event.types";

export const useLogout = () => {
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);
  const { clearAuth } = useAuthStore();
  const client = useApolloClient();
  const { socket } = useSocket();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);

    try {
      if (socket?.connected) {
        socket.emit(PRESENCE_SOCKET_EVENTS.USER_LOGOUT);
        socket.disconnect();
      } else {
        disconnectSocket();
      }
    } catch (e) {
      console.error("Socket disconnect error:", e);
    }

    try {
      await logoutMutation();

    } catch (e) {
      console.error("Backend logout error:", e);
    }

    try {
      await logoutAction();
    } catch (e) {
      console.error("Next.js logout action error:", e);
    }

    clearAuth();
    try {
      await client.clearStore();
    } catch {}

    window.location.href = "/login";
  };

  return {
    logout,
    isLoggingOut,
  };
};
