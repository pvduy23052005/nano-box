"use client";

import UserEmptyState from "./UserEmptyState";

export interface FriendListProps {
  searchQuery?: string;
}

export default function FriendList({ searchQuery = "" }: FriendListProps) {
  return (
    <UserEmptyState
      tab="friends"
      description={
        searchQuery
          ? `Không tìm thấy bạn bè nào khớp với "${searchQuery}". Hãy thử tìm kiếm bằng từ khóa khác.`
          : 'Hãy kết nối với mọi người từ tab "Tất cả" để bắt đầu trò chuyện và chia sẻ.'
      }
    />
  );
}
