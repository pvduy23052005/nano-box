"use client";

import { useState } from "react";
import { BellOff, Bookmark, ChevronRight, LogOut, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Switch } from "@/src/components/ui/switch";
import { toast } from "sonner";

interface RoomActionsCardProps {
  isGroup?: boolean;
  onLeaveRoom?: () => void;
  onEditRoom?: () => void;
  onPinnedMessages?: () => void;
}

export default function RoomActionsCard({
  isGroup = false,
  onLeaveRoom,
  onEditRoom,
  onPinnedMessages,
}: RoomActionsCardProps) {
  const [isMuted, setIsMuted] = useState(false);

  const handleToggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    toast.success(
      newState
        ? "Đã tắt thông báo phòng này"
        : "Đã bật lại thông báo phòng này",
    );
  };

  const handleEdit = () => {
    if (onEditRoom) {
      onEditRoom();
      return;
    }
    toast.info("Tính năng chỉnh sửa thông tin đang được cập nhật");
  };

  const handlePinned = () => {
    if (onPinnedMessages) {
      onPinnedMessages();
      return;
    }
    toast.info("Xem tin nhắn đã ghim");
  };

  const handleLeave = () => {
    if (onLeaveRoom) {
      onLeaveRoom();
      return;
    }
    toast.info(isGroup ? "Rời khỏi nhóm trò chuyện" : "Đóng cuộc trò chuyện");
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-3 pb-0 flex-row items-center justify-between">
        <CardTitle className="text-base font-bold">Thao tác phòng</CardTitle>
      </CardHeader>

      <CardContent className="p-3 flex flex-col gap-2">
        {isGroup && (
          <button
            type="button"
            onClick={handleEdit}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Pencil className="size-4 text-muted-foreground shrink-0" />
              <p className="text-sm font-medium truncate">
                Chỉnh sửa thông tin phòng
              </p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        <div className="w-full flex items-center justify-between p-3.5 rounded-xl bg-muted/40">
          <div className="flex items-center gap-3 min-w-0 pr-3">
            <BellOff className="size-4 text-muted-foreground shrink-0" />
            <label
              htmlFor="mute-room-notifications"
              className="flex flex-col min-w-0 cursor-pointer"
            >
              <span className="text-sm font-medium">
                Tắt thông báo phòng
              </span>
              <span className="text-xs text-muted-foreground truncate">
                Chỉ nhận khi được nhắc đến (@)
              </span>
            </label>
          </div>

          <Switch
            id="mute-room-notifications"
            checked={isMuted}
            onCheckedChange={handleToggleMute}
          />
        </div>

        <button
          type="button"
          onClick={handlePinned}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Bookmark className="size-4 text-muted-foreground shrink-0" />
            <p className="text-sm font-medium truncate">
              Tin nhắn đã ghim (24)
            </p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          type="button"
          onClick={handleLeave}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-muted/40 hover:bg-destructive/10 transition-colors cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <LogOut className="size-4 text-muted-foreground group-hover:text-destructive shrink-0" />
            <p className="text-sm font-medium group-hover:text-destructive truncate">
              Rời khỏi phòng
            </p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 group-hover:text-destructive transition-transform" />
        </button>
      </CardContent>
    </Card>
  );
}
