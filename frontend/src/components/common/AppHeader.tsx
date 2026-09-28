"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { useRoomStore } from "@/src/features/room/stores/useRoomStore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";
import { Bell, CircleChevronDown, LogOut, UserPen } from "lucide-react";
import { useNotifications } from "@/src/features/notification/hooks/useNotifications";
import { NotificationItem } from "@/src/features/notification/types/notification.types";
import NotificationSheet from "@/src/features/notification/components/NotificationSheet";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Spinner } from "../ui/spinner";
import { useLogout } from "@/src/features/auth/hooks/useLogout";
import EditProfileDialog from "@/src/features/user/components/EditProfileDialog";
import { cn } from "@/src/lib/utils";

export default function AppHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setActiveRoomId = useRoomStore((state) => state.setActiveRoomId);
  const { logout, isLoggingOut } = useLogout();

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

        <Popover open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
          <PopoverTrigger
            className="flex items-center gap-2 rounded-full md:rounded-xl p-1 md:px-2 md:py-1 hover:bg-accent/70 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Tài khoản cá nhân"
          >
            <div className="relative">
              <Avatar className="size-8">
                <AvatarImage
                  src={user?.avatar || "/logo.png"}
                  alt={user?.name || "avatar"}
                />
                <AvatarFallback>
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "US"}
                </AvatarFallback>
              </Avatar>
              <CircleChevronDown
                className={cn(
                  "absolute -bottom-1 -right-1 size-4 text-white bg-primary rounded-full transition-transform duration-200",
                  isUserMenuOpen && "rotate-180",
                )}
              />
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-medium text-foreground leading-tight">
                {user?.name}
              </span>
              <span className="text-[11px] text-muted-foreground truncate max-w-[140px] leading-tight">
                {user?.email}
              </span>
            </div>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            side="bottom"
            sideOffset={8}
            className="w-56 p-2 shadow-lg rounded-2xl"
          >
            <div className="space-y-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2.5 h-9 text-xs font-medium cursor-pointer rounded-xl hover:bg-accent text-foreground hover:text-foreground"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  setIsEditProfileOpen(true);
                }}
              >
                <UserPen className="size-4 text-muted-foreground" />
                <span>Thông tin tài khoản</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={logout}
                disabled={isLoggingOut}
                className="w-full justify-start gap-2.5 h-9 text-xs font-medium cursor-pointer rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                {isLoggingOut ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <LogOut data-icon="inline-start" className="size-4" />
                )}
                <span>Đăng xuất</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {isEditProfileOpen && (
          <EditProfileDialog onClose={() => setIsEditProfileOpen(false)} />
        )}
      </div>
    </header>
  );
}
