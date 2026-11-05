"use client";

import { useApolloClient, useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { MemberRole } from "../types/room.type";
import type { GetRoomDetailQuery } from "@/src/types/graphql/graphql";
import {
  ADD_MEMBER_TO_ROOM_MUTATION,
  GET_ROOM_DETAIL_QUERY,
} from "../room.mutation";

export const useAddMember = () => {
  const client = useApolloClient();
  const [addMemberMutation, { loading: isAdding }] = useMutation(
    ADD_MEMBER_TO_ROOM_MUTATION,
  );

  const addMember = async (
    roomId: string,
    userId: string,
    memberName?: string,
    memberAvatar?: string | null,
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
            addMemberToRoom: {
              __typename: "RoomOutput" as const,
              ...currentRoom,
              members: [
                ...(currentRoom.members || []),
                {
                  __typename: "RoomMemberOutput" as const,
                  role: MemberRole.MEMBER,
                  user: {
                    __typename: "RoomMemberUserOutput" as const,
                    id: userId,
                    name: memberName || "Người dùng",
                    avatar: memberAvatar || "",
                  },
                },
              ],
            },
          }
        : undefined;

      const response = await addMemberMutation({
        variables: { input: { roomId, userId } },
        optimisticResponse,
        update(cache, { data }) {
          const updated = data?.addMemberToRoom;
          if (!updated) return;
          cache.writeQuery({
            query: GET_ROOM_DETAIL_QUERY,
            variables: { roomId },
            data: { getRoomDetail: updated },
          });
        },
      });

      if (response.data?.addMemberToRoom) {
        toast.success(
          memberName
            ? `Đã thêm ${memberName} vào nhóm`
            : "Đã thêm thành viên vào nhóm thành công",
        );
        return true;
      }
      return false;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể thêm thành viên vào nhóm";
      toast.error(message);
      return false;
    }
  };

  return {
    addMember,
    isAdding,
  };
};
