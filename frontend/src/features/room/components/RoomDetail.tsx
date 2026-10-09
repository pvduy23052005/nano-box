"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetRoomDetail } from "../hooks/useGetRoomDetail";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { usePresenceStore } from "@/src/features/user/stores/usePresenceStore";
import { MemberRole, RoomType } from "../types/room.type";
import RoomProfileCard from "./room-detail/RoomProfileCard";
import RoomActionsCard from "./room-detail/RoomActionsCard";
import RoomMemberList from "./room-detail/RoomMemberList";
import RoomDetailSkeleton from "./room-detail/RoomDetailSkeleton";
import RoomDetailError from "./room-detail/RoomDetailError";
import AddMemberDrawer from "./room-detail/AddMemberDrawer";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface RoomDetailViewProps {
  roomId: string;
}

export default function RoomDetailView({ roomId }: RoomDetailViewProps) {
  const router = useRouter();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const onlineUsers = usePresenceStore((state) => state.onlineUsers);
  const [isAddMemberDrawerOpen, setIsAddMemberDrawerOpen] = useState(false);

  const { room, loading, error, refetch } = useGetRoomDetail(roomId);

  const handleBack = () => {
    router.push("/chat");
  };

  const isGroup = room?.typeRoom === RoomType.GROUP;
  const members = useMemo(() => room?.members ?? [], [room?.members]);

  const existingMemberIds = useMemo(() => {
    return members
      .map((m) => m.user?.id)
      .filter((id): id is string => Boolean(id));
  }, [members]);

  const canAddMember = useMemo(() => {
    if (!isGroup || !currentUserId) return false;
    const myMember = members.find(
      (member) => member?.user?.id === currentUserId,
    );
    return (
      myMember?.role === MemberRole.SUPER_ADMIN ||
      myMember?.role === MemberRole.ADMIN
    );
  }, [isGroup, currentUserId, members]);

  if (loading) {
    return <RoomDetailSkeleton />;
  }

  if (error || !room) {
    return <RoomDetailError onRetry={() => refetch()} onBack={handleBack} />;
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-background text-foreground">
      <div className="w-full mx-auto p-2.5 sm:p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-primary hover:text-primary/80 h-9 px-2 text-sm font-medium cursor-pointer"
          >
            <ArrowLeft data-icon="inline-start" />
            <span className="truncate">Quay lại cuộc trò chuyện</span>
          </Button>

          {canAddMember && (
            <Button
              size="icon"
              aria-label="Thêm thành viên"
              className="shrink-0 cursor-pointer"
              onClick={() => setIsAddMemberDrawerOpen(true)}
            >
              <UserPlus />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start w-full min-w-0">
          <div className="lg:col-span-4 flex flex-col gap-2 w-full min-w-0">
            <RoomProfileCard
              room={room}
              currentUserId={currentUserId}
              onClickAddMember={() => setIsAddMemberDrawerOpen(true)}
            />
            <RoomActionsCard isGroup={isGroup} onLeaveRoom={handleBack} />
          </div>

          <div className="lg:col-span-8 w-full min-w-0">
            <RoomMemberList
              roomId={roomId}
              members={members}
              currentUserId={currentUserId}
              onlineUsers={onlineUsers}
            />
          </div>
        </div>
      </div>

      {canAddMember && isAddMemberDrawerOpen && (
        <AddMemberDrawer
          onClose={() => setIsAddMemberDrawerOpen(false)}
          roomId={roomId}
          existingMemberIds={existingMemberIds}
        />
      )}
    </div>
  );
}
