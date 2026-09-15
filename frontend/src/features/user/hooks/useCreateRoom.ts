import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CREATE_ROOM_CHAT_NOT_FRIEND_MUTATION } from "../mutations/user.mutation";
import { useRoomStore } from "../../room/stores/useRoomStore";
import { MemberRole, MemberStatus, RoomType } from "../../room/types/room.type";
import { appendRoomToCache } from "../../room/room.cache";

export interface CreateRoomTargetUser {
  id: string;
  name?: string;
  avatar?: string | null;
}

export const useCreateRoomChatNotFriend = () => {
  const [createRoomChatNotFriendMutation, { loading }] = useMutation(
    CREATE_ROOM_CHAT_NOT_FRIEND_MUTATION
  );
  const [creatingUserId, setCreatingUserId] = useState<string | null>(null);
  const { setActiveRoom } = useRoomStore();
  const router = useRouter();

  const createRoom = async (target: string | CreateRoomTargetUser) => {
    const targetUser: CreateRoomTargetUser =
      typeof target === "string"
        ? { id: target, name: "Cuộc trò chuyện mới" }
        : target;
    const otherUserId = targetUser.id;

    setCreatingUserId(otherUserId);
    const tempRoomId = `temp-${Date.now()}`;

    const optimisticRoom = {
      id: tempRoomId,
      title: targetUser.name || "Cuộc trò chuyện mới",
      typeRoom: RoomType.SINGLE,
      avatar: targetUser.avatar || null,
      lastMessageId: null,
      members: [
        {
          userId: otherUserId,
          role: MemberRole.MEMBER,
          status: MemberStatus.WAITTING,
        },
      ],
    };

    setActiveRoom({
      id: tempRoomId,
      title: optimisticRoom.title,
      typeRoom: optimisticRoom.typeRoom,
      avatar: optimisticRoom.avatar,
      lastMessageId: null,
    });
    router.push("/chat");

    try {
      const response = await createRoomChatNotFriendMutation({
        variables: { otherUserId },
        optimisticResponse: {
          createRoomChatNotFriend: optimisticRoom,
        },
        update(cache, { data }) {
          const newRoom = data?.createRoomChatNotFriend;
          if (!newRoom) return;

          appendRoomToCache(
            cache,
            {
              id: newRoom.id,
              title: newRoom.title,
              typeRoom: newRoom.typeRoom,
              lastMessageId: newRoom.lastMessageId,
              avatar: newRoom.avatar,
            },
            MemberStatus.ACCEPTED,
            tempRoomId,
          );
        },
      });

      const room = response.data?.createRoomChatNotFriend;
      if (room) {
        setActiveRoom({
          id: room.id,
          title: room.title,
          typeRoom: room.typeRoom,
          avatar: room.avatar,
          lastMessageId: room.lastMessageId,
        });
        return room;
      }
    } catch (err: unknown) {
      const currentActive = useRoomStore.getState().activeRoom;
      if (currentActive?.id === tempRoomId) {
        useRoomStore.getState().setActiveRoom(null);
      }
      const message =
        err instanceof Error ? err.message : "Không thể tạo phòng trò chuyện";
      toast.error(message);
      throw err;
    } finally {
      setCreatingUserId(null);
    }
  };

  return {
    createRoomChatNotFriend: createRoom,
    loading,
    creatingUserId,
  };
};

export const useCreateRoom = useCreateRoomChatNotFriend;
