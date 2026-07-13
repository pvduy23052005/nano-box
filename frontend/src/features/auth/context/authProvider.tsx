"use client";

import { useQuery } from "@apollo/client/react";
import { GET_ME_QUERY } from "../services/mutations";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";
import { Spinner } from "@/src/components/ui/spinner";

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

  if (loading)
    return (
      <>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"></div>
      </>
    );

  return children;
}
