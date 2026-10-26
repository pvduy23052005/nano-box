"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { MessageSquare, Users } from "lucide-react";
import NavUser from "./NavUser";

const navGroups = [
  {
    label: "GIAO TIẾP",
    items: [
      {
        title: "Tin nhắn trực tiếp",
        url: "/chat",
        icon: MessageSquare,
      },
      {
        title: "Người dùng",
        url: "/users",
        icon: Users,
      },
    ],
  },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
        <Link
          href="/chat"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <div className="flex aspect-square size-10 items-center justify-center rounded-xl">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={100}
              height={100}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-bold text-primary whitespace-nowrap">
              NANO BOX
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      size="sm"
                      className="h-8 cursor-pointer"
                      tooltip={item.title}
                      isActive={pathname.startsWith(item.url)}
                      render={<Link href={item.url} />}
                    >
                      <item.icon />
                      <span className="font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
