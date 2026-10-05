"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/components/ui/input-group";
import { Button } from "@/src/components/ui/button";
import { useEffect, useState } from "react";
import RoomFriend from "../../room/components/RoomFriend";
import RoomStranger from "../../room/components/RoomStranger";
import CreateGroupRoomDialog from "../../room/components/CreateGroupRoomDialog";
import { useGetRooms } from "../../room/hooks/useGetRooms";
import { useReceiveRoom } from "../../room/socket/useReceiveRoom";
import { useRoomStore, ChatRoom } from "../../room/stores/useRoomStore";
import { MemberStatus } from "../../room/types/room.type";
import { Plus, Search, Users, X } from "lucide-react";
import { useDebounce } from "@/src/hooks/useDebounce";

export enum RoomTypeSearch {
  FRIEND = "friends",
  STRANGER = "strangers",
}

export default function ChatSidebar() {
  const [activeTab, setActiveTab] = useState<RoomTypeSearch>(
    RoomTypeSearch.FRIEND,
  );
  const [prevActiveRoomId, setPrevActiveRoomId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const debouncedSearch = useDebounce(searchValue.trim(), 350);

  const {
    rooms: friendRooms,
    loading: loadingFriends,
    error: errorFriends,
  } = useGetRooms(MemberStatus.ACCEPTED, debouncedSearch);

  const {
    rooms: strangerRooms,
    loading: loadingStrangers,
    error: errorStrangers,
  } = useGetRooms(MemberStatus.WAITTING, debouncedSearch);

  useReceiveRoom();

  const { activeRoomId, activeRoom, setActiveRoom } = useRoomStore();

  if (activeRoomId !== prevActiveRoomId) {
    setPrevActiveRoomId(activeRoomId);
    if (activeRoomId) {
      const isStrangerRoom = (strangerRooms as ChatRoom[]).some(
        (strangerRoom) => strangerRoom.id === activeRoomId,
      );
      if (isStrangerRoom) {
        setActiveTab(RoomTypeSearch.STRANGER);
      } else {
        const isFriendRoom = (friendRooms as ChatRoom[]).some(
          (friendRoom) => friendRoom.id === activeRoomId,
        );
        if (isFriendRoom) {
          setActiveTab(RoomTypeSearch.FRIEND);
        }
      }
    }
  }

  useEffect(() => {
    if (activeRoomId) {
      if (activeRoom?.id !== activeRoomId) {
        const foundRoom =
          (friendRooms as ChatRoom[]).find(
            (friendRoom) => friendRoom.id === activeRoomId,
          ) ||
          (strangerRooms as ChatRoom[]).find(
            (strangerRoom) => strangerRoom.id === activeRoomId,
          );

        if (foundRoom) {
          setActiveRoom(foundRoom);
        }
      }
    } else if (friendRooms.length > 0) {
      setActiveRoom(friendRooms[0] as ChatRoom);
    }
  }, [friendRooms, strangerRooms, activeRoomId, activeRoom?.id, setActiveRoom]);

  return (
    <aside className="w-full sm:w-64 md:w-80 border-b sm:border-b-0 sm:border-r flex flex-col h-auto max-h-[130px] sm:max-h-none sm:h-full bg-background shrink-0">
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as RoomTypeSearch)}
        className="w-full flex flex-col min-h-0 gap-0"
      >
        <div className="p-1.5 pb-0 sm:p-2 border-b flex flex-col gap-1.5">
          <div className="hidden sm:flex items-center gap-1.5">
            <InputGroup className="h-7 flex-1">
              <InputGroupAddon align="inline-start">
                <Search className="size-3.5" />
              </InputGroupAddon>
              <InputGroupInput
                className="h-6 py-0 text-xs"
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              {searchValue && (
                <InputGroupAddon align="inline-end">
                  <button
                    type="button"
                    onClick={() => setSearchValue("")}
                    className="cursor-pointer text-muted-foreground hover:text-foreground p-0.5"
                    title="Xóa tìm kiếm"
                  >
                    <X className="size-3" />
                  </button>
                </InputGroupAddon>
              )}
            </InputGroup>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsCreateGroupOpen(true)}
              className="size-7 cursor-pointer shrink-0"
              title="Tạo nhóm chat"
              aria-label="Tạo nhóm chat"
            >
              <Plus data-icon="inline-start" className="size-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <TabsList variant="line" className="grid flex-1 grid-cols-2">
              <TabsTrigger
                value={RoomTypeSearch.FRIEND}
                className="text-xs py-1 sm:py-1.5 font-medium cursor-pointer after:hidden"
              >
                Bạn bè
              </TabsTrigger>
              <TabsTrigger
                value={RoomTypeSearch.STRANGER}
                className="text-xs py-1 sm:py-1.5 font-medium cursor-pointer after:hidden"
              >
                Người lạ
              </TabsTrigger>
            </TabsList>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsCreateGroupOpen(true)}
              className="size-7 sm:hidden cursor-pointer shrink-0 text-muted-foreground hover:text-foreground"
              title="Tạo nhóm chat"
              aria-label="Tạo nhóm chat"
            >
              <Users data-icon="inline-start" className="size-3.5" />
            </Button>
          </div>
        </div>

        <TabsContent
          value={RoomTypeSearch.FRIEND}
          className="w-full flex flex-row sm:flex-col overflow-x-auto sm:overflow-y-auto flex-1 mt-0 scrollbar-none"
        >
          <RoomFriend
            rooms={friendRooms as ChatRoom[]}
            isLoading={loadingFriends}
            error={!!errorFriends}
            emptyMessage={
              debouncedSearch
                ? "Không tìm thấy cuộc trò chuyện nào"
                : "Chưa có cuộc trò chuyện"
            }
          />
        </TabsContent>

        <TabsContent
          value={RoomTypeSearch.STRANGER}
          className="w-full flex flex-row sm:flex-col overflow-x-auto sm:overflow-y-auto flex-1 mt-0 scrollbar-none"
        >
          <RoomStranger
            rooms={strangerRooms as ChatRoom[]}
            isLoading={loadingStrangers}
            error={!!errorStrangers}
            emptyMessage={
              debouncedSearch
                ? "Không tìm thấy cuộc trò chuyện nào"
                : "Không có tin nhắn từ người lạ"
            }
          />
        </TabsContent>
      </Tabs>

      {isCreateGroupOpen && (
        <CreateGroupRoomDialog
          onClose={() => setIsCreateGroupOpen(false)}
        />
      )}
    </aside>
  );
}

