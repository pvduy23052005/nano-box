"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import {
  LayoutGrid,
  MessageSquare,
  Users,
  ClipboardList,
  CheckCircle,
  Calendar,
  BarChart,
  Folder,
  FileText,
} from "lucide-react";

const data = {
  overview: [
    {
      title: "Tổng quan",
      url: "/",
      icon: LayoutGrid,
    },
  ],
  groups: [
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
    {
      label: "CÔNG VIỆC",
      items: [
        { title: "Dự án", url: "/project", icon: ClipboardList },
        { title: "Nhiệm vụ", url: "/task", icon: CheckCircle },
        { title: "Lịch", url: "/calendar", icon: Calendar },
      ],
    },
    {
      label: "TÀI NGUYÊN",
      items: [
        { title: "Báo cáo", url: "/report", icon: BarChart },
        { title: "Tập tin", url: "/files", icon: Folder },
        { title: "Tài liệu", url: "/docs", icon: FileText },
      ],
    },
  ],
};

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-2">
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
            <span className="text-lg font-bold text-primary whitespace-nowrap ">
              NANO BOX
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.overview.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    size="lg"
                    isActive={pathname === item.url}
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

        {data.groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      size="sm"
                      className="h-8"
                      isActive={
                        item.url === "/"
                          ? pathname === "/"
                          : pathname.startsWith(item.url)
                      }
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
    </Sidebar>
  );
}
