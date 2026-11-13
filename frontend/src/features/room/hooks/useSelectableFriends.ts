"use client";

import { useMemo, useState } from "react";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useFriends } from "@/src/features/user/hooks/useGetFriends";
import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { SelectedUser } from "../components/create-group/types";

interface UseSelectableFriendsOptions {
  excludeIds?: string[];
}

export function useSelectableFriends(
  options: UseSelectableFriendsOptions = {},
) {
  const { excludeIds = [] } = options;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);

  const debouncedSearch = useDebounce(searchQuery.trim(), 300);
  const { friends, loading: loadingFriends } = useFriends(debouncedSearch);
  const currentUserId = useAuthStore((state) => state.user?.id);

  const availableFriends = useMemo(() => {
    const excludedSet = new Set(excludeIds);
    if (currentUserId) excludedSet.add(currentUserId);

    return (friends || []).filter((friend) => !excludedSet.has(friend.id));
  }, [friends, excludeIds, currentUserId]);

  const handleToggleUser = (user: SelectedUser) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((selectedUser) => selectedUser.id === user.id);
      if (exists) {
        return prev.filter((selectedUser) => selectedUser.id !== user.id);
      }
      return [...prev, user];
    });
  };

  const handleRemoveSelectedUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.filter((selectedUser) => selectedUser.id !== userId),
    );
  };

  const resetSelection = () => {
    setSearchQuery("");
    setSelectedUsers([]);
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedUsers,
    availableFriends,
    totalFriendsCount: (friends || []).length,
    loadingFriends,
    handleToggleUser,
    handleRemoveSelectedUser,
    resetSelection,
  };
}
