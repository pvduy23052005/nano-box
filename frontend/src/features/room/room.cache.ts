import { ApolloCache } from "@apollo/client";
import { GET_ROOMS_BY_STATUS_QUERY } from "./room.mutation";
import { MemberStatus, RoomType, GetRoomsByStatusQuery } from "@/src/types/graphql/graphql";

export type LastMessageCacheItem = {
  id?: string | null;
  content?: string | null;
  senderId?: string | null;
  createdAt?: unknown;
} | null;

export interface CachedRoomItem {
  id: string;
  title: string | null;
  typeRoom: RoomType;
  lastMessageId?: LastMessageCacheItem;
  avatar?: string | null;
}

export const appendRoomToCache = (
  cache: ApolloCache,
  newRoom: CachedRoomItem,
  status: MemberStatus = "ACCEPTED",
  tempId?: string,
): void => {
  const normalizedRoom = {
    id: newRoom.id,
    title: newRoom.title ?? null,
    typeRoom: newRoom.typeRoom,
    lastMessageId: newRoom.lastMessageId
      ? {
          id: newRoom.lastMessageId.id ?? null,
          content: newRoom.lastMessageId.content ?? null,
          senderId: newRoom.lastMessageId.senderId ?? null,
          createdAt: newRoom.lastMessageId.createdAt ?? null,
        }
      : null,
    avatar: newRoom.avatar ?? null,
  };

  cache.updateQuery<GetRoomsByStatusQuery>(
    { query: GET_ROOMS_BY_STATUS_QUERY, variables: { status } },
    (existing) => {
      if (!existing?.getRoomsByStatus) {
        return {
          getRoomsByStatus: [normalizedRoom],
        };
      }

      const currentRooms = existing.getRoomsByStatus || [];

      const otherRooms = currentRooms.filter((room) => {
        if (tempId && room.id === tempId) return false;
        if (room.id === newRoom.id) return false;
        return true;
      });

      return {
        getRoomsByStatus: [normalizedRoom, ...otherRooms],
      };
    },
  );
};
