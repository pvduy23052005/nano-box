import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { useUsers } from "../hooks/useUsers";
import { Spinner } from "../../../components/ui/spinner";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { MessageSquare, UserPlus } from "lucide-react";
import { Typography } from "@/src/components/ui/typography";

export default function UserCard() {
  const { users, loading, error } = useUsers();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        Lỗi khi tải danh sách người dùng.
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Không có người dùng nào.
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <Card
          key={user.id}
          className="relative p-3 flex flex-col gap-0 transition-colors"
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
              onClick={() => console.log("Kết bạn", user.id)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Kết bạn
            </Button>

            <Button
              size="sm"
              className="text-white bg-primary hover:bg-primary/80 transition-colors h-8 px-4 cursor-pointer"
              onClick={() => console.log("Nhắn tin", user.id)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Nhắn tin
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
