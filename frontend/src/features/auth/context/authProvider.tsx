"use client";

import { useQuery } from "@apollo/client/react";
import { GET_ME_QUERY } from "../services/mutations";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";
import LoadingPage from "@/src/components/common/LoadingPage";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser } = useAuthStore();
  const { data, loading, error } = useQuery(GET_ME_QUERY, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data) {
      setUser(data.getMe);
    } else if (error) {
      setUser(null);
    }
  }, [data, setUser, error]);

  if (loading) return <LoadingPage />;

  return children;
}
