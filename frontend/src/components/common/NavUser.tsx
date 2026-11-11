"use client";

import { useState } from "react";
import { ChevronsUpDown, LogOut, UserPen } from "lucide-react";
import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { useLogout } from "@/src/features/auth/hooks/useLogout";
import EditProfileDialog from "@/src/features/user/components/EditProfileDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/src/components/ui/sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Button } from "@/src/components/ui/button";
import { Spinner } from "@/src/components/ui/spinner";

export default function NavUser() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const { isMobile } = useSidebar();

  const user = useAuthStore((state) => state.user);
  const { logout, isLoggingOut } = useLogout();

  return (
    <>
      <SidebarMenu className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
        <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  tooltip={user?.name || "Tài khoản"}
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer h-12 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:overflow-visible"
                />
              }
            >
              <div className="relative flex aspect-square size-8 items-center justify-center shrink-0">
                <Avatar className="size-8 rounded-full">
                  <AvatarImage
                    src={user?.avatar ?? "/logo.png"}
                    alt={user?.name ?? "avatar"}
                  />
                  <AvatarFallback className="rounded-full text-xs font-semibold">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : "US"}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold text-foreground">
                  {user?.name ?? "Người dùng"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email ?? ""}
                </span>
              </div>

              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
            </PopoverTrigger>

            <PopoverContent
              className="w-56 p-2 shadow-lg rounded-2xl"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={8}
            >
              <div className="flex flex-col gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-9 text-xs font-medium cursor-pointer rounded-xl hover:bg-accent text-foreground hover:text-foreground"
                  onClick={() => {
                    setIsOpen(false);
                    setIsEditProfileOpen(true);
                  }}
                >
                  <UserPen data-icon="inline-start" className="text-muted-foreground" />
                  Thông tin tài khoản
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  disabled={isLoggingOut}
                  className="w-full justify-start h-9 text-xs font-medium cursor-pointer rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  {isLoggingOut ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <LogOut data-icon="inline-start" />
                  )}
                  Đăng xuất
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </SidebarMenuItem>
      </SidebarMenu>

      {isEditProfileOpen && (
        <EditProfileDialog onClose={() => setIsEditProfileOpen(false)} />
      )}
    </>
  );
}
