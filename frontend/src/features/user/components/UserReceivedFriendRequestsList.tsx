"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import { Typography } from "@/src/components/ui/typography";
import UserLoading from "./UserLoading";
import UserEmptyState from "./UserEmptyState";
import { Check, X } from "lucide-react";
import { useGetReceivedFriendRequests } from "../hooks/useGetReceivedFriendRequests";
import { useAcceptFriendRequest } from "../hooks/useAcceptFriendRequest";
import { useRejectFriendRequest } from "../hooks/useRejectFriendRequest";

export default function ReceivedFriendRequestsList() {
  const { requests, loading, error } = useGetReceivedFriendRequests();
  const { acceptRequest } = useAcceptFriendRequest();
  const { rejectRequest } = useRejectFriendRequest();

  if (loading) {
    return <UserLoading count={6} />;
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-destructive text-sm">
        Đã xảy ra lỗi khi tải danh sách lời mời kết bạn.
      </div>
    );
  }

  if (requests.length === 0) {
    return <UserEmptyState tab="received" />;
  }

  return (
    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {requests.map((request) => {
        const { sender } = request;

        return (
          <div
            key={request.id}
            className="p-3 bg-card shadow-sm hover:border-primary/40 hover:shadow-md flex flex-row items-center justify-between gap-2 transition-all rounded-xl"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative shrink-0">
                <Avatar className="size-10 after:border-none">
                  <AvatarImage src={sender.avatar || ""} alt={sender.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {sender.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-col min-w-0">
                <Typography
                  variant="small"
                  className="font-semibold text-foreground truncate"
                >
                  {sender.name}
                </Typography>
                {sender.email && (
                  <Typography
                    variant="muted"
                    className="text-xs text-muted-foreground truncate"
                  >
                    {sender.email}
                  </Typography>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                className="text-xs h-8 px-2.5 cursor-pointer shadow-xs"
                onClick={() => acceptRequest(sender.id)}
                title="Chấp nhận"
              >
                <Check data-icon="inline-start" />
                Đồng ý
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 px-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                onClick={() => rejectRequest(sender.id)}
                title="Từ chối"
              >
                <X data-icon="inline-start" />
                Từ chối
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
