import { ApolloCache } from "@apollo/client";
import { GET_ROOMS_BY_STATUS_QUERY } from "./room.mutation";
import { RoomType, GetRoomsByStatusQuery } from "@/src/types/graphql/graphql";
import { MemberStatus } from "./types/room.type";

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
  members?: Array<{
    userId: string;
    lastReadMessageId?: string | null;
  }> | null;
}

export const appendRoomToCache = (
  cache: ApolloCache,
  newRoom: CachedRoomItem,
  status: MemberStatus = MemberStatus.ACCEPTED,
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
    members: newRoom.members
      ? newRoom.members.map((m) => ({
          userId: m.userId,
          lastReadMessageId: m.lastReadMessageId ?? null,
        }))
      : null,
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

export const updateRoomLastMessageInCache = (
  cache: ApolloCache,
  roomId: string,
  lastMessage: LastMessageCacheItem,
  preferredStatus?: MemberStatus,
): void => {
  const statusesToTry: MemberStatus[] = preferredStatus
    ? [
        preferredStatus,
        preferredStatus === MemberStatus.ACCEPTED
          ? MemberStatus.WAITTING
          : MemberStatus.ACCEPTED,
      ]
    : [MemberStatus.ACCEPTED, MemberStatus.WAITTING];

  for (const status of statusesToTry) {
    let found = false;

    cache.updateQuery<GetRoomsByStatusQuery>(
      { query: GET_ROOMS_BY_STATUS_QUERY, variables: { status } },
      (existing) => {
        if (!existing?.getRoomsByStatus) return existing;

        const currentRooms = existing.getRoomsByStatus;
        const targetRoom = currentRooms.find((room) => room.id === roomId);

        if (!targetRoom) return existing;

        found = true;

        const updatedRoom = {
          ...targetRoom,
          lastMessageId: lastMessage
            ? {
              id: lastMessage.id ?? null,
              content: lastMessage.content ?? null,
              senderId: lastMessage.senderId ?? null,
              createdAt: lastMessage.createdAt ?? null,
            }
            : null,
        };

        const otherRooms = currentRooms.filter((room) => room.id !== roomId);

        return {
          getRoomsByStatus: [updatedRoom, ...otherRooms],
        };
      },
    );

    if (found) break;
  }
};

