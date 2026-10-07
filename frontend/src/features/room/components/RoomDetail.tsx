"use client";

import { useRouter } from "next/navigation";
import { useGetRoomDetail } from "../hooks/useGetRoomDetail";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { usePresenceStore } from "@/src/features/user/stores/usePresenceStore";
import { RoomType } from "../types/room.type";
import RoomProfileCard from "./room-detail/RoomProfileCard";
import RoomActionsCard from "./room-detail/RoomActionsCard";
import RoomMemberList from "./room-detail/RoomMemberList";
import RoomDetailSkeleton from "./room-detail/RoomDetailSkeleton";
import RoomDetailError from "./room-detail/RoomDetailError";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface RoomDetailViewProps {
  roomId: string;
}

export default function RoomDetailView({ roomId }: RoomDetailViewProps) {
  const router = useRouter();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const onlineUsers = usePresenceStore((state) => state.onlineUsers);

  const { room, loading, error, refetch } = useGetRoomDetail(roomId);

  const handleBack = () => {
    router.push("/chat");
  };

  if (loading) {
    return <RoomDetailSkeleton />;
  }

  if (error || !room) {
    return <RoomDetailError onRetry={() => refetch()} onBack={handleBack} />;
  }

  const isGroup = room.typeRoom === RoomType.GROUP;
  const members = room.members || [];

  return (
    <div className="h-full w-full overflow-y-auto bg-background text-foreground">
      <div className="w-full mx-auto p-2.5 sm:p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-primary hover:text-primary/80 h-9 px-2 text-sm font-medium"
          >
            <ArrowLeft data-icon="inline-start" />
            <span className="truncate">Quay lại cuộc trò chuyện</span>
          </Button>
          <Button size="icon" aria-label="Thêm thành viên" className="shrink-0">
            <UserPlus />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start w-full min-w-0">
          <div className="lg:col-span-4 flex flex-col gap-2 w-full min-w-0">
            <RoomProfileCard
              room={room}
              currentUserId={currentUserId}
              onClickAddMember={handleBack}
            />
            <RoomActionsCard isGroup={isGroup} onLeaveRoom={handleBack} />
          </div>

          <div className="lg:col-span-8 w-full min-w-0">
            <RoomMemberList
              members={members}
              currentUserId={currentUserId}
              onlineUsers={onlineUsers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
