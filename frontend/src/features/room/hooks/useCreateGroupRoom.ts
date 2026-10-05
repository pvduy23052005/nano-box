import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CREATE_GROUP_ROOM_MUTATION } from "../room.mutation";
import { useRoomStore } from "../stores/useRoomStore";
import { MemberStatus } from "../types/room.type";
import { appendRoomToCache } from "../room.cache";
import { CreateGroupRoomInput } from "@/src/types/graphql/graphql";

export const useCreateGroupRoom = () => {
  const [createGroupRoomMutation, { loading }] = useMutation(
    CREATE_GROUP_ROOM_MUTATION,
  );
  const { setActiveRoom } = useRoomStore();
  const router = useRouter();

  const createGroupRoom = async (input: CreateGroupRoomInput) => {
    try {
      const response = await createGroupRoomMutation({
        variables: { input },
        update(cache, { data }) {
          const newRoom = data?.createGroupRoom;
          if (!newRoom) return;

          appendRoomToCache(
            cache,
            {
              id: newRoom.id,
              title: newRoom.title,
              typeRoom: newRoom.typeRoom,
              lastMessageId: newRoom.lastMessageId,
              avatar: newRoom.avatar,
              members: newRoom.members,
            },
            MemberStatus.ACCEPTED,
          );
        },
      });

      const room = response.data?.createGroupRoom;
      if (room) {
        setActiveRoom({
          id: room.id,
          title: room.title,
          typeRoom: room.typeRoom,
          avatar: room.avatar,
          lastMessageId: room.lastMessageId,
        });
        router.push("/chat");
        return room;
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Không thể tạo nhóm trò chuyện";
      toast.error(message);
      throw err;
    }
  };

  return {
    createGroupRoom,
    loading,
  };
};
