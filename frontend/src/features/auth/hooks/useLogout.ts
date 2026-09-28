"use client";

import { useState } from "react";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { LOGOUT_MUTATION } from "../services/mutations";
import { useAuthStore } from "../store/useAuthStore";
import { logoutAction } from "../actions/logout.action";
import { toast } from "sonner";

export const useLogout = () => {
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);
  const { clearAuth } = useAuthStore();
  const client = useApolloClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
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

    toast.success("Đã đăng xuất thành công");
    window.location.href = "/login";
  };

  return {
    logout,
    isLoggingOut,
  };
};
