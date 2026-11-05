import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/src/components/ui/avatar";
import { Check } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { SelectedUser } from "./types";

interface FriendSelectItemProps {
  friend: SelectedUser;
  isSelected: boolean;
  onToggle: (user: SelectedUser) => void;
}

export default function FriendSelectItem({
  friend,
  isSelected,
  onToggle,
}: FriendSelectItemProps) {
  return (
    <div
      onClick={() => onToggle(friend)}
      className={cn(
        "flex items-center justify-between p-2.5 sm:px-3 hover:bg-accent/60 transition-colors cursor-pointer select-none",
        isSelected && "bg-accent/80",
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar className="size-8 shrink-0">
          <AvatarImage src={friend.avatar || "/logo.png"} alt={friend.name} />
          <AvatarFallback className="text-xs">
            {friend.name?.slice(0, 2).toUpperCase() || "US"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0 text-left">
          <span className="text-xs sm:text-sm font-medium text-foreground truncate">
            {friend.name}
          </span>
          <span className="text-[11px] text-muted-foreground truncate">
            {friend.email}
          </span>
        </div>
      </div>

      <div
        className={cn(
          "size-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ml-2",
          isSelected
            ? "bg-primary border-primary text-primary-foreground"
            : "border-muted-foreground/40 bg-background",
        )}
      >
        {isSelected && <Check className="size-3.5 stroke-[3]" />}
      </div>
    </div>
  );
}
