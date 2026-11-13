"use client";

import { useMemo, useState } from "react";
import { useGetRoomDetail } from "./useGetRoomDetail";
import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { usePresenceStore } from "@/src/features/user/stores/usePresenceStore";
import { MemberRole, RoomType } from "../types/room.type";

export function useRoomDetailController(roomId: string) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const onlineUsers = usePresenceStore((state) => state.onlineUsers);

  const [isAddMemberDrawerOpen, setIsAddMemberDrawerOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLeaveRoomOpen, setIsLeaveRoomOpen] = useState(false);

  const { room, loading, error, refetch } = useGetRoomDetail(roomId);

  const isGroup = room?.typeRoom === RoomType.GROUP;
  const members = useMemo(() => room?.members ?? [], [room?.members]);

  const existingMemberIds = useMemo(() => {
    return members
      .map((member) => member.user?.id)
      .filter((id): id is string => Boolean(id));
  }, [members]);

  const isSuperAdmin = useMemo(() => {
    if (!isGroup || !currentUserId) return false;
    const myMember = members.find(
      (member) => member?.user?.id === currentUserId,
    );
    return myMember?.role === MemberRole.SUPER_ADMIN;
  }, [isGroup, currentUserId, members]);

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

  return {
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
  };
}
