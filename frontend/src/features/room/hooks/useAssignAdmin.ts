"use client";

import { useApolloClient, useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { MemberRole } from "../types/room.type";
import type { GetRoomDetailQuery } from "@/src/types/graphql/graphql";
import {
  ASSIGN_ROOM_ADMIN_MUTATION,
  GET_ROOM_DETAIL_QUERY,
} from "../room.mutation";

export const useAssignAdmin = () => {
  const client = useApolloClient();
  const [assignAdminMutation, { loading: isAssigning }] = useMutation(
    ASSIGN_ROOM_ADMIN_MUTATION,
  );

  const assignAdmin = async (
    roomId: string,
    userId: string,
    memberName?: string,
  ): Promise<boolean> => {
    try {
      const currentData = client.readQuery<GetRoomDetailQuery>({
        query: GET_ROOM_DETAIL_QUERY,
        variables: { roomId },
      });
      const currentRoom = currentData?.getRoomDetail;

      const optimisticResponse = currentRoom
        ? {
            __typename: "Mutation" as const,
            assignRoomAdmin: {
              __typename: "RoomOutput" as const,
              ...currentRoom,
              members: (currentRoom.members || []).map((m) =>
                m.user?.id === userId ? { ...m, role: MemberRole.ADMIN } : m,
              ),
            },
          }
        : undefined;

      const response = await assignAdminMutation({
        variables: { input: { roomId, userId } },
        optimisticResponse,
        update(cache, { data }) {
          const updated = data?.assignRoomAdmin;
          if (!updated) return;
          cache.writeQuery({
            query: GET_ROOM_DETAIL_QUERY,
            variables: { roomId },
            data: { getRoomDetail: updated },
          });
        },
      });

      if (response.data?.assignRoomAdmin) {
        toast.success(
          memberName
            ? `Đã bổ nhiệm ${memberName} làm Quản trị viên`
            : "Đã bổ nhiệm Quản trị viên thành công",
        );
        return true;
      }
      return false;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể bổ nhiệm Quản trị viên";
      toast.error(message);
      return false;
    }
  };

  return {
    assignAdmin,
    isAssigning,
  };
};
