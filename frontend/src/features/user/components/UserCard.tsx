import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Spinner } from "../../../components/ui/spinner";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { MessageSquare, UserPlus } from "lucide-react";
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
  onStartChat: (id: string) => void;
  onAddFriend?: (id: string) => void;
}

export default function UserCard({
  user,
  isCreating = false,
  onStartChat,
  onAddFriend,
}: UserCardProps) {
  return (
    <Card
      key={user.id}
      className="relative p-3 flex flex-col gap-0 transition-colors hover:border-primary/50 cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14 border border-border">
          <AvatarImage src={user.avatar || ""} alt={user.name} />
          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg font-medium">
            {user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden">
          <Typography variant="small">{user.name}</Typography>
        </div>
      </div>

      <div className="my-4 border-t border-border" />

      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8 px-4 cursor-pointer"
          onClick={() => onAddFriend?.(user.id)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Kết bạn
        </Button>

        <Button
          size="sm"
          disabled={isCreating}
          className="text-white bg-primary hover:bg-primary/80 transition-colors h-8 px-4 cursor-pointer"
          onClick={() => onStartChat(user.id)}
        >
          {isCreating ? (
            <Spinner className="h-4 w-4 mr-2" />
          ) : (
            <MessageSquare className="h-4 w-4 mr-2" />
          )}
          Nhắn tin
        </Button>
      </div>
    </Card>
  );
}
