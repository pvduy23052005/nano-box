import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Spinner } from "../../../components/ui/spinner";
import { Button } from "../../../components/ui/button";
import { MessageSquare, UserCheck, UserPlus } from "lucide-react";
import { Typography } from "@/src/components/ui/typography";

export interface UserItem {
  id: string;
  name: string;
  email?: string;
  avatar?: string | null;
}

export interface UserCardProps {
  user: UserItem;
  isCreating?: boolean;
  isFriendRequestSent?: boolean;
  onStartChat: (id: string) => void;
  onAddFriend?: (id: string) => void;
}

export default function UserCard({
  user,
  isCreating = false,
  isFriendRequestSent = false,
  onStartChat,
  onAddFriend,
}: UserCardProps) {
  return (
    <div
      key={user.id}
      className="p-3 bg-card shadow-sm hover:border-primary/40 hover:shadow-md flex flex-row items-center justify-between gap-2 transition-all cursor-pointer rounded-xl"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative shrink-0">
          <Avatar className="size-10 after:border-none">
            <AvatarImage src={user.avatar || ""} alt={user.name} />
            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-semibold">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col min-w-0">
          <Typography
            variant="small"
            className="font-semibold text-foreground truncate"
          >
            {user.name}
          </Typography>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="icon"
          disabled={isFriendRequestSent || isCreating}
          className={`size-8 cursor-pointer transition-colors ${
            isFriendRequestSent
              ? "text-emerald-600 bg-emerald-50 border-emerald-200"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isFriendRequestSent) {
              onAddFriend?.(user.id);
            }
          }}
          title={
            isFriendRequestSent
              ? "Đã gửi lời mời kết bạn"
              : "Kết bạn"
          }
        >
          {isFriendRequestSent ? (
            <UserCheck className="size-4" />
          ) : (
            <UserPlus className="size-4" />
          )}
        </Button>

        <Button
          size="sm"
          disabled={isCreating}
          className="text-xs h-8 px-3.5 text-white bg-primary hover:bg-primary/90 transition-colors cursor-pointer font-medium shadow-xs"
          onClick={(e) => {
            e.stopPropagation();
            onStartChat(user.id);
          }}
        >
          {isCreating ? (
            <Spinner className="size-3.5 mr-1.5" />
          ) : (
            <MessageSquare className="size-3.5 mr-1.5" />
          )}
          <span className="md:hidden lg:block">Nhắn tin</span>
        </Button>
      </div>
    </div>
  );
}
