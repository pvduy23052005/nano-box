"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { useRoomStore } from "@/src/features/room/stores/useRoomStore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";
import { Bell } from "lucide-react";
import { useNotifications } from "@/src/features/notification/hooks/useNotifications";
import { NotificationItem } from "@/src/features/notification/types/notification.types";
import NotificationSheet from "@/src/features/notification/components/NotificationSheet";

export default function AppHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setActiveRoomId = useRoomStore((state) => state.setActiveRoomId);

  const {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    markAsRead,
  } = useNotifications({ enabled: isOpen });

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    if (notification.metadata?.roomId) {
      setActiveRoomId(notification.metadata.roomId);
      router.push("/chat");
      setIsOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/80 px-2 sm:px-4">
      <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground cursor-pointer" />

      <div className="flex items-center gap-3">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen((prev) => !prev)}
            className="relative rounded-full hover:bg-accent/70 transition-colors cursor-pointer"
            aria-label="Thông báo"
          >
            <Bell className="size-4 text-muted-foreground hover:text-foreground transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm animate-in zoom-in-50">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>

          <NotificationSheet
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            notifications={notifications}
            unreadCount={unreadCount}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            loadMore={loadMore}
            onNotificationClick={handleNotificationClick}
          />
        </div>

        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={user?.avatar || "/logo.png"} alt="avatar" />
            <AvatarFallback>{user?.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {user?.name}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[160px]">
              {user?.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
