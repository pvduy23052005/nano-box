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
import { useEffect, useState } from "react";
import RoomFriend from "../../room/components/RoomFriend";
import RoomStranger from "../../room/components/RoomStranger";
import { useGetRooms } from "../../room/hooks/useGetRooms";
import { useReceiveRoom } from "../../room/socket/useReceiveRoom";
import { useRoomStore, ChatRoom } from "../../room/stores/useRoomStore";
import { MemberStatus } from "../../room/types/room.type";
import { Search } from "lucide-react";

export enum RoomTypeSearch {
  FRIEND = "friends",
  STRANGER = "strangers",
}

export default function ChatSidebar() {
  const [activeTab, setActiveTab] = useState<RoomTypeSearch>(
    RoomTypeSearch.FRIEND,
  );

  const {
    rooms: friendRooms,
    loading: loadingFriends,
    error: errorFriends,
  } = useGetRooms(MemberStatus.ACCEPTED);

  const {
    rooms: strangerRooms,
    loading: loadingStrangers,
    error: errorStrangers,
  } = useGetRooms(MemberStatus.WAITTING);

  useReceiveRoom();

  const { activeRoomId, setActiveRoom } = useRoomStore();

  useEffect(() => {
    if (!activeRoomId && friendRooms.length > 0) {
      setActiveRoom(friendRooms[0] as ChatRoom);
    }
  }, [friendRooms, activeRoomId, setActiveRoom]);

  return (
    <aside className="w-64 md:w-80 border-r flex flex-col h-full bg-background shrink-0">
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as RoomTypeSearch)}
        className="w-full flex-1 flex flex-col min-h-0"
      >
        <div className="p-2 border-b flex flex-col gap-2">
          <InputGroup className="h-7">
            <InputGroupAddon>
              <Search className="size-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              className="h-6 py-0 text-xs"
              placeholder="Tìm kiếm cuộc trò truyện..."
            />
          </InputGroup>

          <TabsList variant="line" className="grid w-full grid-cols-2">
            <TabsTrigger
              value={RoomTypeSearch.FRIEND}
              className="text-xs py-1.5 font-medium"
            >
              Bạn bè
            </TabsTrigger>
            <TabsTrigger
              value={RoomTypeSearch.STRANGER}
              className="text-xs py-1.5 font-medium"
            >
              Người lạ
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value={RoomTypeSearch.FRIEND}
          className="w-full flex flex-col gap-1 p-2 overflow-y-auto flex-1 mt-0"
        >
          <RoomFriend
            rooms={friendRooms as ChatRoom[]}
            isLoading={loadingFriends}
            error={!!errorFriends}
          />
        </TabsContent>

        <TabsContent
          value={RoomTypeSearch.STRANGER}
          className="w-full flex flex-col gap-1 p-2 overflow-y-auto flex-1 mt-0"
        >
          <RoomStranger
            rooms={strangerRooms as ChatRoom[]}
            isLoading={loadingStrangers}
            error={!!errorStrangers}
          />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
