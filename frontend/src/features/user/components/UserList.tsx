"use client";

import { useUsers } from "../hooks/useUsers";
import { useCreateRoomChatNotFriend } from "../hooks/useCreateRoom";
import { useSendFriendRequest } from "../hooks/useSendFriendRequest";
import { useAuthStore } from "../../auth/store/useAuthStore";
import UserLoading from "./UserLoading";
import UserEmptyState from "./UserEmptyState";
import UserCard from "./UserCard";

export interface UserListProps {
  searchQuery?: string;
}

export default function UserList({ searchQuery = "" }: UserListProps) {
  const { users, loading, error } = useUsers(searchQuery);
  const { createRoomChatNotFriend, creatingUserId } =
    useCreateRoomChatNotFriend();
  const { sendFriendRequest, isSent } = useSendFriendRequest();
  const { user: currentUser } = useAuthStore();

  const handleStartChat = async (userId: string) => {
    if (creatingUserId) return;
    const targetUser = displayUsers.find((user) => user.id === userId);
    try {
      await createRoomChatNotFriend(targetUser || userId);
    } catch {}
  };
  const displayUsers = users.filter((user) => user.id !== currentUser?.id);

  if (loading) {
    return <UserLoading count={6} />;
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-destructive text-sm">
        Lỗi khi tải danh sách người dùng.
      </div>
    );
  }

  if (!displayUsers || displayUsers.length === 0) {
    return (
      <UserEmptyState
        tab="all"
        description={
          searchQuery
            ? `Không tìm thấy người dùng nào khớp với "${searchQuery}". Hãy thử tìm kiếm bằng từ khóa khác.`
            : "Chưa có người dùng nào khác trong hệ thống."
        }
      />
    );
  }

  return (
    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {displayUsers.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          isCreating={creatingUserId === user.id}
          isFriendRequestSent={isSent(user.id)}
          onStartChat={handleStartChat}
          onAddFriend={() => sendFriendRequest(user)}
        />
      ))}
    </div>
  );
}
