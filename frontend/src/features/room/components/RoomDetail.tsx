"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useRoomDetailController } from "../hooks/useRoomDetailController";
import RoomProfileCard from "./room-detail/RoomProfileCard";
import RoomActionsCard from "./room-detail/RoomActionsCard";
import RoomMemberList from "./room-detail/RoomMemberList";
import RoomDetailSkeleton from "./room-detail/RoomDetailSkeleton";
import RoomDetailError from "./room-detail/RoomDetailError";
import RoomDetailModals from "./room-detail/RoomDetailModals";

interface RoomDetailProps {
  roomId: string;
}

export default function RoomDetail({ roomId }: RoomDetailProps) {
  const router = useRouter();
  const {
    room,
    loading,
    error,
    refetch,
    currentUserId,
    onlineUsers,
    isGroup,
    members,
    existingMemberIds,
    isSuperAdmin,
    canAddMember,
    isAddMemberDrawerOpen,
    setIsAddMemberDrawerOpen,
    isEditProfileOpen,
    setIsEditProfileOpen,
    isLeaveRoomOpen,
    setIsLeaveRoomOpen,
  } = useRoomDetailController(roomId);

  const handleBack = () => {
    router.push("/chat");
  };

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
            className="text-primary hover:text-primary/80 h-9 px-2 text-sm font-medium"
          >
            <ArrowLeft data-icon="inline-start" />
            <span className="truncate">Quay lại cuộc trò chuyện</span>
          </Button>

          {canAddMember && (
            <Button
              size="icon"
              aria-label="Thêm thành viên"
              className="shrink-0"
              onClick={() => setIsAddMemberDrawerOpen(true)}
            >
              <UserPlus />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start w-full min-w-0">
          <div className="lg:col-span-4 flex flex-col gap-2 w-full min-w-0">
            <RoomProfileCard room={room} currentUserId={currentUserId} />
            <RoomActionsCard
              isGroup={isGroup}
              onLeaveRoom={() => setIsLeaveRoomOpen(true)}
              onEditRoom={
                canAddMember ? () => setIsEditProfileOpen(true) : undefined
              }
            />
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

      <RoomDetailModals
        roomId={roomId}
        room={room}
        isGroup={isGroup}
        isSuperAdmin={isSuperAdmin}
        canAddMember={canAddMember}
        existingMemberIds={existingMemberIds}
        memberCount={members.length}
        isAddMemberDrawerOpen={isAddMemberDrawerOpen}
        setIsAddMemberDrawerOpen={setIsAddMemberDrawerOpen}
        isEditProfileOpen={isEditProfileOpen}
        setIsEditProfileOpen={setIsEditProfileOpen}
        isLeaveRoomOpen={isLeaveRoomOpen}
        setIsLeaveRoomOpen={setIsLeaveRoomOpen}
      />
    </div>
  );
}
