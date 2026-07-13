"use client";

import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SidebarTrigger } from "../ui/sidebar";

export default function AppHeader() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/80 px-2">
      <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground cursor-pointer" />

      <div className="flex gap-2">
        <Avatar>
          <AvatarImage src="/logo.png" alt="avatar" />
          <AvatarFallback>NB</AvatarFallback>
        </Avatar>
        <div className="hidden md:flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {user?.name}
          </span>
          <span className="text-xs text-muted-foreground trunced">
            {user?.email}
          </span>
        </div>
      </div>
    </header>
  );
}
