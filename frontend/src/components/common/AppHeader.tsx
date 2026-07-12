"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SidebarTrigger } from "../ui/sidebar";

export default function AppHeader() {
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
            Phùng Văn Duy
          </span>
          <span className="text-xs text-muted-foreground trunced">pvduy@gmail.com</span>
        </div>
      </div>
    </header>
  );
}
