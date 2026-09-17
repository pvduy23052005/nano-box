import { useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { MemberStatus, GetRoomsByStatusQuery } from "@/src/types/graphql/graphql";
import { GET_ROOMS_BY_STATUS_QUERY } from "../room.mutation";
import { useReadReceiptStore } from "../../chat/stores/useReadReceiptStore";
type RoomItem = NonNullable<GetRoomsByStatusQuery["getRoomsByStatus"]>[number];

const EMPTY_ROOMS: RoomItem[] = [];

export const useGetRooms = (status: MemberStatus = "ACCEPTED") => {
  const initializeRoomReads = useReadReceiptStore(
    (state) => state.initializeRoomReads,
  );
  const { data, loading, error, refetch } = useQuery(GET_ROOMS_BY_STATUS_QUERY, {
    variables: { status },
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

