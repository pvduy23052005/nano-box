"use client";

import { useState } from "react";
import { BellOff, Bookmark, ChevronRight, LogOut, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";
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
    } else {
      toast.info("Tính năng chỉnh sửa thông tin đang được cập nhật");
    }
  };

  const handlePinned = () => {
    if (onPinnedMessages) {
      onPinnedMessages();
    } else {
      toast.info("Xem tin nhắn đã ghim");
    }
  };

  const handleLeave = () => {
    if (onLeaveRoom) {
      onLeaveRoom();
    } else {
      toast.info(isGroup ? "Rời khỏi nhóm trò chuyện" : "Đóng cuộc trò chuyện");
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-3 pb-0 flex-row items-center justify-between border-0">
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
              <span className="text-sm font-medium text-foreground truncate">
                Chỉnh sửa thông tin phòng
              </span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        <div className="w-full flex items-center justify-between p-3.5 rounded-xl bg-muted/40">
          <div className="flex items-center gap-3 min-w-0 pr-3">
            <BellOff className="size-4 text-muted-foreground shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground">
                Tắt thông báo phòng
              </span>
              <span className="text-xs text-muted-foreground truncate">
                Chỉ nhận khi được nhắc đến (@)
              </span>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isMuted}
            onClick={handleToggleMute}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
              isMuted ? "bg-primary" : "bg-input",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-5 transform rounded-full shadow-md ring-0 transition duration-200 ease-in-out",
                isMuted
                  ? "translate-x-5 bg-primary-foreground"
                  : "translate-x-0 bg-background",
              )}
            />
          </button>
        </div>

        <button
          type="button"
          onClick={handlePinned}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Bookmark className="size-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground truncate">
              Tin nhắn đã ghim (24)
            </span>
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
            <span className="text-sm font-medium text-foreground group-hover:text-destructive truncate">
              Rời khỏi phòng
            </span>
          </div>
          <ChevronRight className="size-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 group-hover:text-destructive transition-transform" />
        </button>
      </CardContent>
    </Card>
  );
}
