"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useRoomStore } from "@/src/features/room/stores/useRoomStore";
import { SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";
import { Bell, Plus } from "lucide-react";
import { useNotifications } from "@/src/features/notification/hooks/useNotifications";
import { NotificationItem } from "@/src/features/notification/types/notification.types";
import NotificationSheet from "@/src/features/notification/components/NotificationSheet";
import CreateGroupRoomDialog from "@/src/features/room/components/CreateGroupRoomDialog";

export default function AppHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const isChatPage = pathname?.startsWith("/chat");

  const setActiveRoomId = useRoomStore((state) => state.setActiveRoomId);
  const isCreateGroupOpen = useRoomStore((state) => state.isCreateGroupOpen);
  const setIsCreateGroupOpen = useRoomStore(
    (state) => state.setIsCreateGroupOpen,
  );

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
    <header className="sticky top-0 z-50 flex h-10 items-center justify-between border-b border-border bg-background/80 px-2 sm:px-4">
      <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground cursor-pointer" />

      <div className="flex items-center gap-1">
        {isChatPage && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsCreateGroupOpen(true)}
            className="sm:hidden relative rounded-full hover:bg-accent/70 transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            title="Tạo nhóm chat"
            aria-label="Tạo nhóm chat"
          >
            <Plus className="size-5" />
          </Button>
        )}

        <div>
          <Button
            variant="ghost"
            onClick={() => setIsOpen((prev) => !prev)}
            className="relative rounded-full hover:bg-accent/70 transition-colors cursor-pointer"
            aria-label="Thông báo"
          >
            <Bell className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
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

        {isCreateGroupOpen && (
          <CreateGroupRoomDialog onClose={() => setIsCreateGroupOpen(false)} />
        )}
      </div>
    </header>
  );
}
