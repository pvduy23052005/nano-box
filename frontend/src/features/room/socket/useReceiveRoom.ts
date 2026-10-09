import { useEffect } from "react";
import { useApolloClient } from "@apollo/client/react";
import { useSocket } from "@/src/providers/SocketProvider";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { RoomType } from "@/src/types/graphql/graphql";
import { MemberStatus } from "../types/room.type";
import { appendRoomToCache } from "../room.cache";
import { ROOM_SOCKET_EVENTS } from "../types/event.types";
import { GET_ROOM_DETAIL_QUERY } from "../room.mutation";
import { useRoomStore } from "../stores/useRoomStore";

export interface ReceiveRoomMember {
  userId: string;
  role: string;
  status: MemberStatus;
}

export interface ReceiveRoomPayload {
  id: string;
  title: string | null;
  typeRoom: RoomType;
  lastMessageId?: {
    id?: string | null;
    content?: string | null;
    senderId?: string | null;
    createdAt?: unknown;
  } | null;
  members: ReceiveRoomMember[];
  avatar?: string | null;
}

export const useReceiveRoom = () => {
  const client = useApolloClient();
  const { socket } = useSocket();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveRoom = (roomData: ReceiveRoomPayload) => {
      if (!roomData?.id) return;

      const myMember = roomData.members?.find((members) => members.userId === user?.id);
      const status: MemberStatus = (myMember?.status as MemberStatus) || MemberStatus.WAITTING;

      appendRoomToCache(
        client.cache,
        {
          id: roomData.id,
          title: roomData.title,
          typeRoom: roomData.typeRoom,
          lastMessageId: roomData.lastMessageId,
          avatar: roomData.avatar,
          members: roomData.members,
        },
        status,
      );

      const activeRoom = useRoomStore.getState().activeRoom;
      if (activeRoom && activeRoom.id === roomData.id) {
        useRoomStore.getState().setActiveRoom({
          ...activeRoom,
          title: roomData.title,
          avatar: roomData.avatar ?? null,
        });
      }

      client.refetchQueries({
        include: [GET_ROOM_DETAIL_QUERY],
      });
    };

    socket.on(ROOM_SOCKET_EVENTS.SERVER_SEND_ROOM, handleReceiveRoom);
    socket.on(ROOM_SOCKET_EVENTS.ROOM_UPDATED, handleReceiveRoom);

    return () => {
      socket.off(ROOM_SOCKET_EVENTS.SERVER_SEND_ROOM, handleReceiveRoom);
      socket.off(ROOM_SOCKET_EVENTS.ROOM_UPDATED, handleReceiveRoom);
    };
  }, [client, socket, user?.id]);
};
