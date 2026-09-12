"use client";

import { useUsers } from "../hooks/useUsers";
import { useCreateRoomChatNotFriend } from "../hooks/useCreateRoom";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { Spinner } from "../../../components/ui/spinner";
import UserCard from "./UserCard";

export interface UserListProps {
  searchQuery?: string;
}

export default function UserList({ searchQuery = "" }: UserListProps) {
  const { users, loading, error } = useUsers(searchQuery);
  const { createRoomChatNotFriend, creatingUserId } =
    useCreateRoomChatNotFriend();
  const { user: currentUser } = useAuthStore();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-red-500">
        Lỗi khi tải danh sách người dùng.
      </div>
    );
  }

  const displayUsers = users.filter((u) => u.id !== currentUser?.id);

  if (!displayUsers || displayUsers.length === 0) {
    return (
      <div className="flex h-64 mt-10 items-center justify-center text-muted-foreground">
        Không tìm thấy người dùng nào phù hợp.
      </div>
    );
  }

  const handleStartChat = async (userId: string) => {
    if (creatingUserId) return;
    const targetUser = displayUsers.find((u) => u.id === userId);
    try {
      await createRoomChatNotFriend(targetUser || userId);
    } catch {}
  };

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {displayUsers.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          isCreating={creatingUserId === user.id}
          onStartChat={handleStartChat}
          onAddFriend={() => {}}
        />
      ))}
    </div>
  );
}
