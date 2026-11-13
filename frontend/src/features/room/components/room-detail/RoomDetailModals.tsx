"use client";

import AddMemberDrawer from "./AddMemberDrawer";
import EditRoomProfileDialog from "./EditRoomProfileDialog";
import ConfirmLeaveRoomDialog from "./ConfirmLeaveRoomDialog";
import { RoomDetailData } from "./types";

interface RoomDetailModalsProps {
  roomId: string;
  room: RoomDetailData;
  isGroup: boolean;
  isSuperAdmin: boolean;
  canAddMember: boolean;
  existingMemberIds: string[];
  memberCount: number;
  isAddMemberDrawerOpen: boolean;
  setIsAddMemberDrawerOpen: (open: boolean) => void;
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (open: boolean) => void;
  isLeaveRoomOpen: boolean;
  setIsLeaveRoomOpen: (open: boolean) => void;
}

export default function RoomDetailModals({
  roomId,
  room,
  isGroup,
  isSuperAdmin,
  canAddMember,
  existingMemberIds,
  memberCount,
  isAddMemberDrawerOpen,
  setIsAddMemberDrawerOpen,
  isEditProfileOpen,
  setIsEditProfileOpen,
  isLeaveRoomOpen,
  setIsLeaveRoomOpen,
}: RoomDetailModalsProps) {
  return (
    <>
      {canAddMember && isAddMemberDrawerOpen && (
        <AddMemberDrawer
          onClose={() => setIsAddMemberDrawerOpen(false)}
          roomId={roomId}
          existingMemberIds={existingMemberIds}
        />
      )}

      {canAddMember && (
        <EditRoomProfileDialog
          open={isEditProfileOpen}
          onOpenChange={setIsEditProfileOpen}
          roomId={roomId}
          initialTitle={room.title || ""}
          initialAvatar={room.avatar}
          groupAvatars={room.groupAvatars}
        />
      )}

      {isGroup && (
        <ConfirmLeaveRoomDialog
          open={isLeaveRoomOpen}
          onOpenChange={setIsLeaveRoomOpen}
          roomId={roomId}
          roomTitle={room.title ?? ""}
          isSuperAdmin={isSuperAdmin}
          memberCount={memberCount}
        />
      )}
    </>
  );
}
