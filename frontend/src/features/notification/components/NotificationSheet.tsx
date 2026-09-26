"use client";

import { Button } from "@/src/components/ui/button";
import { Spinner } from "@/src/components/ui/spinner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/src/components/ui/sheet";
import { useReceiveNotification } from "../socket/useReceiveNotification";
import { NotificationItem } from "../types/notification.types";
import NotificationCard from "./NotificationCard";
import NotificationEmptyState from "./NotificationEmptyState";
import NotificationLoading from "./NotificationLoading";

interface NotificationSheetProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  notifications: NotificationItem[];
  unreadCount?: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  className?: string;
}

export default function NotificationSheet({
  isOpen,
  setIsOpen,
  notifications,
  unreadCount,
  isLoading,
  isLoadingMore,
  hasMore,
  loadMore,
}: NotificationSheetProps) {
  useReceiveNotification();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        className="w-full sm:w-[420px] max-w-full p-0 flex flex-col gap-0 border-l border-border bg-popover shadow-2xl"
      >
        <SheetHeader className="p-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <SheetTitle className="text-base font-semibold text-foreground">
              Thông báo
            </SheetTitle>
            {unreadCount !== undefined && unreadCount > 0 && (
              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {unreadCount} mới
              </span>
            )}
          </div>
          <SheetDescription className="text-xs text-muted-foreground mt-0.5">
            Tất cả thông báo và tin nhắn gửi đến bạn
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto flex flex-col">
          {isLoading ? (
            <NotificationLoading />
          ) : notifications.length === 0 ? (
            <NotificationEmptyState />
          ) : (
            <>
              <div className="flex flex-col">
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="p-3 border-t border-border/40 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="w-full text-xs text-muted-foreground hover:text-foreground h-9 cursor-pointer"
                  >
                    {isLoadingMore && <Spinner data-icon="inline-start" />}
                    {isLoadingMore ? "Đang tải thêm..." : "Tải thêm thông báo"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
