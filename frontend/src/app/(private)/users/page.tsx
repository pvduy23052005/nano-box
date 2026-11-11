"use client";

import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/components/ui/input-group";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Filter, Inbox, Search, UserCheck, Users } from "lucide-react";
import { useDebounce } from "../../../hooks/useDebounce";
import UserList from "../../../features/user/components/UserList";
import FriendList from "../../../features/user/components/UserFriendList";
import ReceivedFriendRequestsList from "../../../features/user/components/UserReceivedFriendRequestsList";
import { useGetReceivedFriendRequests } from "../../../features/user/hooks/useGetReceivedFriendRequests";

export enum UserTab {
  ALL = "all",
  FRIENDS = "friends",
  RECEIVED = "received",
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<UserTab>(UserTab.ALL);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { count: receivedCount } = useGetReceivedFriendRequests();

  return (
    <div className="flex h-screen flex-col w-full bg-background text-foreground">
      <main className="flex-1 overflow-auto p-4 w-full mx-auto">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as UserTab)}
          className="w-full flex flex-col gap-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-2">
            <TabsList
              variant="line"
              className="bg-muted/70 p-1 rounded-xl h-auto grid grid-cols-3 w-full sm:w-auto sm:inline-flex"
            >
              <TabsTrigger
                value={UserTab.ALL}
                className="rounded-lg px-2 sm:px-3.5 py-1.5 text-sm font-medium cursor-pointer gap-1.5 sm:gap-2 justify-center"
                title="Tất cả"
              >
                <Users className="size-4 shrink-0" />
                <span className="hidden sm:inline">Tất cả</span>
              </TabsTrigger>
              <TabsTrigger
                value={UserTab.FRIENDS}
                className="rounded-lg px-2 sm:px-3.5 py-1.5 text-sm font-medium cursor-pointer gap-1.5 sm:gap-2 justify-center"
                title="Bạn bè"
              >
                <UserCheck className="size-4 shrink-0" />
                <span className="hidden sm:inline">Bạn bè</span>
              </TabsTrigger>
              <TabsTrigger
                value={UserTab.RECEIVED}
                className="rounded-lg px-2 sm:px-3.5 py-1.5 text-sm font-medium cursor-pointer gap-1 sm:gap-2 justify-center"
                title="Lời mời đã nhận"
              >
                <Inbox className="size-4 shrink-0" />
                <span className="hidden sm:inline">Lời mời đã nhận</span>
                {receivedCount > 0 && (
                  <Badge
                    variant="default"
                    className="h-4 min-w-4 px-1 text-[10px] sm:h-5 sm:min-w-5 sm:px-1.5 sm:text-[11px] flex items-center justify-center rounded-full font-semibold bg-primary text-primary-foreground"
                  >
                    {receivedCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {(activeTab === UserTab.ALL || activeTab === UserTab.FRIENDS) && (
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <div className="relative w-full sm:w-80">
                  <InputGroup className="w-full">
                    <InputGroupAddon>
                      <Search className="size-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="Tìm kiếm người dùng..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                </div>
                <Button
                  variant="outline"
                  className="bg-transparent whitespace-nowrap cursor-pointer shrink-0"
                >
                  <Filter className="mr-2 h-4 w-4" /> Lọc
                </Button>
              </div>
            )}
          </div>

          <TabsContent value={UserTab.ALL} className="mt-0 outline-none">
            <UserList searchQuery={debouncedSearchQuery} />
          </TabsContent>

          <TabsContent value={UserTab.FRIENDS} className="mt-0 outline-none">
            <FriendList searchQuery={debouncedSearchQuery} />
          </TabsContent>

          <TabsContent value={UserTab.RECEIVED} className="mt-0 outline-none">
            <ReceivedFriendRequestsList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
