"use client";

import { useState } from "react";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { GRAPHQL_TYPENAMES } from "@/src/core/constants/graphql.constant";
import {
  GET_ROOM_DETAIL_QUERY,
  UPDATE_ROOM_PROFILE_MUTATION,
} from "../room.mutation";
import { updateRoomProfileInCache } from "../room.cache";
import { useRoomStore } from "../stores/useRoomStore";
import { uploadFile } from "@/src/services/upload.service";
import type { GetRoomDetailQuery } from "@/src/types/graphql/graphql";

export interface UpdateRoomProfileParams {
  roomId: string;
  title: string;
  avatarFile?: File | null;
  removeAvatar?: boolean;
}

export const useUpdateRoomProfile = () => {
  const client = useApolloClient();
  const [updateRoomProfileMutation, { loading: isMutating }] = useMutation(
    UPDATE_ROOM_PROFILE_MUTATION,
  );
  const [isUploading, setIsUploading] = useState(false);
  const updateActiveRoomProfile = useRoomStore(
    (state) => state.updateActiveRoomProfile,
  );

  const updateRoomProfile = async ({
    roomId,
    title,
    avatarFile,
    removeAvatar = false,
  }: UpdateRoomProfileParams): Promise<boolean> => {
    const previousActiveRoom = useRoomStore.getState().activeRoom;

    let finalAvatar: string | null | undefined;
    try {
      const currentData = client.readQuery<GetRoomDetailQuery>({
        query: GET_ROOM_DETAIL_QUERY,
        variables: { roomId },
      });
      const currentRoom = currentData?.getRoomDetail;

      if (avatarFile) {
        setIsUploading(true);
        const uploadRes = await uploadFile(avatarFile, "avatars");
        finalAvatar = uploadRes.url;
        setIsUploading(false);
      } else if (removeAvatar) {
        finalAvatar = null;
      } else {
        finalAvatar = currentRoom?.avatar ?? null;
      }

      const optimisticResponse = currentRoom
        ? {
            __typename: GRAPHQL_TYPENAMES.MUTATION,
            updateRoomProfile: {
              __typename: GRAPHQL_TYPENAMES.ROOM,
              ...currentRoom,
              title,
              avatar: finalAvatar ?? null,
            },
          }
        : undefined;

      updateActiveRoomProfile(title, finalAvatar);
      updateRoomProfileInCache(client.cache, roomId, {
        title,
        avatar: finalAvatar,
      });

      const response = await updateRoomProfileMutation({
        variables: {
          input: {
            roomId,
            title,
            avatar: finalAvatar,
          },
        },
        optimisticResponse,
        update(cache, { data }) {
          const updated = data?.updateRoomProfile;
          if (!updated) return;
          cache.writeQuery({
            query: GET_ROOM_DETAIL_QUERY,
            variables: { roomId },
            data: { getRoomDetail: updated },
          });
          updateRoomProfileInCache(cache, roomId, {
            title: updated.title || title,
            avatar: updated.avatar,
          });
        },
      });

      if (response.data?.updateRoomProfile) {
        toast.success("Cập nhật thông tin phòng thành công");
        return true;
      }
      return false;
    } catch (err: unknown) {
      setIsUploading(false);

      if (previousActiveRoom && previousActiveRoom.id === roomId) {
        useRoomStore.getState().setActiveRoom(previousActiveRoom);
      }

      client.refetchQueries({
        include: [GET_ROOM_DETAIL_QUERY],
      });

      const message =
        err instanceof Error
          ? err.message
          : "Cập nhật thông tin phòng thất bại";
      toast.error(message);
      return false;
    }
  };

  return {
    updateRoomProfile,
    isSubmitting: isMutating || isUploading,
    isUploading,
  };
};
