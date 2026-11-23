import { useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { GetRoomsByStatusQuery } from "@/src/types/graphql/graphql";
import { GET_ROOMS_BY_STATUS_QUERY } from "../room.mutation";
import { useReadReceiptStore } from "../../chat/stores/useReadReceiptStore";
type RoomItem = NonNullable<GetRoomsByStatusQuery["getRoomsByStatus"]>[number];
import { MemberStatus } from "../types/room.type";

const EMPTY_ROOMS: RoomItem[] = [];

export const useGetRooms = (
  status: MemberStatus = MemberStatus.ACCEPTED,
  search?: string,
) => {
  const initializeRoomReads = useReadReceiptStore(
    (state) => state.initializeRoomReads,
  );
  const { data, loading, error, refetch } = useQuery(GET_ROOMS_BY_STATUS_QUERY, {
    variables: {
      status,
      search: search?.trim() ? search.trim() : undefined,
    },
    fetchPolicy: "cache-and-network",
  });

  const rooms = data?.getRoomsByStatus ?? EMPTY_ROOMS;

  useEffect(() => {
    if (rooms.length > 0) {
      initializeRoomReads(rooms);
    }
  }, [rooms, initializeRoomReads]);

  return {
    rooms,
    loading,
    error,
    refetch,
  };
};

