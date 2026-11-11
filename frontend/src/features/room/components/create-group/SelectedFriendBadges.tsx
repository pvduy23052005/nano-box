import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { X } from "lucide-react";
import { SelectedUser } from "./types";

interface SelectedFriendBadgesProps {
  selectedUsers: SelectedUser[];
  onRemove: (userId: string) => void;
}

export default function SelectedFriendBadges({
  selectedUsers,
  onRemove,
}: SelectedFriendBadgesProps) {
  if (selectedUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-lg">
      {selectedUsers.map((user) => (
        <Badge
          key={user.id}
          variant="default"
          className="flex items-center gap-1.5 py-1 px-2 text-xs rounded-full"
        >
          <Avatar className="size-4">
            <AvatarImage src={user.avatar || "/logo.png"} alt={user.name} />
            <AvatarFallback className="text-[9px]">
              {user.name?.slice(0, 2).toUpperCase() || "US"}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[110px] truncate">{user.name}</span>
          <button
            type="button"
            onClick={() => onRemove(user.id)}
            className="cursor-pointer"
            title={`Bỏ chọn ${user.name}`}
            aria-label={`Bỏ chọn ${user.name}`}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
