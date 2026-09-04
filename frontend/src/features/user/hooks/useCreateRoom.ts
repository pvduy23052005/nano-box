import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CREATE_ROOM_CHAT_NOT_FRIEND_MUTATION } from "../mutations/user.mutation";

export const useCreateRoomChatNotFriend = () => {
  const [createRoomChatNotFriendMutation, { loading }] = useMutation(
    CREATE_ROOM_CHAT_NOT_FRIEND_MUTATION
  );
  const [creatingUserId, setCreatingUserId] = useState<string | null>(null);
  const router = useRouter();

  const createRoom = async (otherUserId: string) => {
    setCreatingUserId(otherUserId);
    try {
      const response = await createRoomChatNotFriendMutation({
        variables: { otherUserId },
      });

      const room = response.data?.createRoomChatNotFriend;
      if (room) {
        toast.success("Tạo phòng trò chuyện thành công!");
        router.push("/chat");
        return room;
      }
    } catch (err: unknown) {
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
