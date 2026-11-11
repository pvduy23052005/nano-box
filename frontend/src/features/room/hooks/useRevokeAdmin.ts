"use client";

import {
  GET_ROOM_DETAIL_QUERY,
  REVOKE_ROOM_ADMIN_MUTATION,
} from "../room.mutation";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { GRAPHQL_TYPENAMES } from "@/src/core/constants/graphql.constant";
import { MemberRole } from "../types/room.type";
import type { GetRoomDetailQuery } from "@/src/types/graphql/graphql";

export const useRevokeAdmin = () => {
  const client = useApolloClient();
  const [revokeAdminMutation, { loading: isRevoking }] = useMutation(
    REVOKE_ROOM_ADMIN_MUTATION,
  );

  const revokeAdmin = async (
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
            revokeRoomAdmin: {
              __typename: GRAPHQL_TYPENAMES.ROOM,
              ...currentRoom,
              members: (currentRoom.members || []).map((m) =>
                m.user?.id === userId ? { ...m, role: MemberRole.MEMBER } : m,
              ),
            },
          }
        : undefined;

      const response = await revokeAdminMutation({
        variables: { input: { roomId, userId } },
        optimisticResponse,
        update(cache, { data }) {
          const updated = data?.revokeRoomAdmin;
          if (!updated) return;
          cache.writeQuery({
            query: GET_ROOM_DETAIL_QUERY,
            variables: { roomId },
            data: { getRoomDetail: updated },
          });
        },
      });

      if (response.data?.revokeRoomAdmin) {
        toast.success(
          memberName
            ? `Đã thu hồi quyền Quản trị viên của ${memberName}`
            : "Đã thu hồi quyền Quản trị viên thành công",
        );
        return true;
      }
      return false;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể thu hồi quyền Quản trị viên";
      toast.error(message);
      return false;
    }
  };

  return {
    revokeAdmin,
    isRevoking,
  };
};
