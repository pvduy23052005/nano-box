"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { removeRoomFromCache } from "../room.cache";
import { useRoomStore } from "../stores/useRoomStore";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { LEAVE_ROOM_MUTATION, GET_ROOMS_BY_STATUS_QUERY } from "../room.mutation";

export const useLeaveRoom = () => {
  const client = useApolloClient();
  const router = useRouter();
  const [leaveRoomMutation, { loading: isLeaving }] = useMutation(
    LEAVE_ROOM_MUTATION,
  );

  const leaveRoom = async (roomId: string): Promise<boolean> => {
    try {
      removeRoomFromCache(client.cache, roomId);

      const activeRoom = useRoomStore.getState().activeRoom;
      if (activeRoom?.id === roomId) {
        useRoomStore.getState().setActiveRoom(null);
      }

      router.replace("/chat");

      const response = await leaveRoomMutation({
        variables: { roomId },
      });

      if (response.data?.leaveRoom) {
        toast.success("Đã rời khỏi phòng thành công");
        return true;
      }

      toast.error("Không thể rời khỏi phòng");
      return false;
    } catch (error: unknown) {
      client.refetchQueries({
        include: [GET_ROOMS_BY_STATUS_QUERY],
      });

      const message =
        error instanceof Error ? error.message : "Đã xảy ra lỗi khi rời phòng";
      toast.error(message);
      return false;
    }
  };

  return {
    leaveRoom,
    isLeaving,
  };
};
