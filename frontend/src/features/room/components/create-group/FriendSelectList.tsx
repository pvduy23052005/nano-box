import { Spinner } from "@/src/components/ui/spinner";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/src/components/ui/empty";
import { cn } from "@/src/lib/utils";
import FriendSelectItem from "./FriendSelectItem";
import { SelectedUser } from "./types";

interface FriendSelectListProps {
  friends: SelectedUser[];
  selectedUsers: SelectedUser[];
  onToggleUser: (user: SelectedUser) => void;
  loading: boolean;
  searchQuery: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export default function FriendSelectList({
  friends,
  selectedUsers,
  onToggleUser,
  loading,
  searchQuery,
  emptyTitle = "Bạn chưa có bạn bè nào",
  emptyDescription = "Chỉ có thể tạo nhóm với những người đã là bạn bè (cần tối thiểu 2 bạn bè).",
  className,
}: FriendSelectListProps) {
  const containerClass = cn(
    "border border-border/60 rounded-lg overflow-hidden flex flex-col h-48 bg-muted/10",
    className,
  );

  if (loading) {
    return (
      <div className={containerClass}>
        <div className="flex h-full items-center justify-center p-4 text-xs text-muted-foreground gap-2">
          <Spinner className="size-4" />
          Đang tìm kiếm bạn bè...
        </div>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className={containerClass}>
        <Empty className="h-full p-4 gap-1 border-0">
          <EmptyHeader className="gap-1">
            {searchQuery ? (
              <EmptyDescription className="text-xs">
                Không tìm thấy bạn bè nào khớp với &quot;{searchQuery}&quot;
              </EmptyDescription>
            ) : (
              <>
                <EmptyTitle className="text-xs">{emptyTitle}</EmptyTitle>
                <EmptyDescription className="text-[11px]">
                  {emptyDescription}
                </EmptyDescription>
              </>
            )}
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="flex-1 overflow-y-auto divide-y divide-border/40">
        {friends.map((friend) => (
          <FriendSelectItem
            key={friend.id}
            friend={friend}
            isSelected={selectedUsers.some((u) => u.id === friend.id)}
            onToggle={onToggleUser}
          />
        ))}
      </div>
    </div>
  );
}
