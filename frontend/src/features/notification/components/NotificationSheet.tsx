"use client";

import { Button } from "@/src/components/ui/button";
import { Spinner } from "@/src/components/ui/spinner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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
  onNotificationClick?: (notification: NotificationItem) => void;
  className?: string;
}

export default function NotificationSheet({
  isOpen,
  setIsOpen,
  notifications,
  isLoading,
  isLoadingMore,
  hasMore,
  loadMore,
  onNotificationClick,
}: NotificationSheetProps) {
  useReceiveNotification();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        className="w-full sm:w-[420px] max-w-full p-0 flex flex-col gap-0 border-l border-border bg-popover shadow-2xl"
      >
        <SheetHeader className="p-4 border-b border-border/60 bg-muted/20">
          <SheetTitle className="text-base font-semibold text-foreground">
            Thông báo
          </SheetTitle>
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
                    onClick={() => onNotificationClick?.(notification)}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="border-t border-border/40 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="w-full text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {isLoadingMore && <Spinner data-icon="inline-start" />}
                    {isLoadingMore ? "Đang tải thêm..." : "Xem thêm"}
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
