"use client";

import { useApolloClient, useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { GRAPHQL_TYPENAMES } from "@/src/core/constants/graphql.constant";
import type { GetRoomDetailQuery } from "@/src/types/graphql/graphql";
import {
  GET_ROOM_DETAIL_QUERY,
  REMOVE_MEMBER_FROM_ROOM_MUTATION,
} from "../room.mutation";

export const useRemoveMember = () => {
  const client = useApolloClient();
  const [removeMemberMutation, { loading: isRemoving }] = useMutation(
    REMOVE_MEMBER_FROM_ROOM_MUTATION,
  );

  const removeMember = async (
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
            __typename: GRAPHQL_TYPENAMES.MUTATION,
            removeMemberFromRoom: {
              __typename: GRAPHQL_TYPENAMES.ROOM,
              ...currentRoom,
              members: (currentRoom.members || []).filter(
                (m) => m.user?.id !== userId,
              ),
            },
          }
        : undefined;

      const response = await removeMemberMutation({
        variables: { input: { roomId, userId } },
        optimisticResponse,
        update(cache, { data }) {
          const updated = data?.removeMemberFromRoom;
          if (!updated) return;
          cache.writeQuery({
            query: GET_ROOM_DETAIL_QUERY,
            variables: { roomId },
            data: { getRoomDetail: updated },
          });
        },
      });

      if (response.data?.removeMemberFromRoom) {
        toast.success(
          memberName
            ? `Đã xóa ${memberName} khỏi nhóm`
            : "Đã xóa thành viên khỏi nhóm thành công",
        );
        return true;
      }
      return false;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể xóa thành viên khỏi nhóm";
      toast.error(message);
      return false;
    }
  };

  return {
    removeMember,
    isRemoving,
  };
};
