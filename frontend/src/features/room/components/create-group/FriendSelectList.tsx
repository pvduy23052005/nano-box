import { Spinner } from "@/src/components/ui/spinner";
import FriendSelectItem from "./FriendSelectItem";
import { SelectedUser } from "./types";

interface FriendSelectListProps {
  friends: SelectedUser[];
  selectedUsers: SelectedUser[];
  onToggleUser: (user: SelectedUser) => void;
  loading: boolean;
  searchQuery: string;
}

export default function FriendSelectList({
  friends,
  selectedUsers,
  onToggleUser,
  loading,
  searchQuery,
}: FriendSelectListProps) {
  return (
    <div className="border border-border/60 rounded-lg overflow-hidden flex flex-col h-48 bg-muted/10">
      <div className="flex-1 overflow-y-auto divide-y divide-border/40">
        {loading ? (
          <div className="flex h-full items-center justify-center p-4 text-xs text-muted-foreground gap-2">
            <Spinner />
            <span>Đang tìm kiếm bạn bè...</span>
          </div>
        ) : friends.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center p-4 text-xs text-muted-foreground text-center gap-1">
            {searchQuery ? (
              <span>
                Không tìm thấy bạn bè nào khớp với &quot;{searchQuery}&quot;
              </span>
            ) : (
              <>
                <span className="font-medium text-foreground">
                  Bạn chưa có bạn bè nào
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Chỉ có thể tạo nhóm với những người đã là bạn bè (cần tối thiểu 2 bạn bè).
                </span>
              </>
            )}
          </div>
        ) : (
          friends.map((friend) => (
            <FriendSelectItem
              key={friend.id}
              friend={friend}
              isSelected={selectedUsers.some((u) => u.id === friend.id)}
              onToggle={onToggleUser}
            />
          ))
        )}
      </div>
    </div>
  );
}
