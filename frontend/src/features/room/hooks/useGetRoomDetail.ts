import { useQuery } from "@apollo/client/react";
import { GET_ROOM_DETAIL_QUERY } from "../room.mutation";

interface UseGetRoomDetailOptions {
  skip?: boolean;
}

export const useGetRoomDetail = (
  roomId?: string | null,
  options?: UseGetRoomDetailOptions,
) => {
  const { data, loading, error, refetch } = useQuery(GET_ROOM_DETAIL_QUERY, {
    variables: { roomId: roomId || "" },
    skip: !roomId || options?.skip,
    fetchPolicy: "cache-and-network",
  });

  return {
    room: data?.getRoomDetail ?? null,
    loading,
    error,
    refetch,
  };
};
