import { useQuery } from "@apollo/client/react";
import { MemberStatus } from "@/src/types/graphql/graphql";
import { GET_ROOMS_BY_STATUS_QUERY } from "../room.mutation";

export const useGetRooms = (status: MemberStatus = "ACCEPTED") => {
  const { data, loading, error, refetch } = useQuery(GET_ROOMS_BY_STATUS_QUERY, {
    variables: { status },
    fetchPolicy: "cache-and-network",
  });

  const rooms = data?.getRoomsByStatus || [];

  return {
    rooms,
    loading,
    error,
    refetch,
  };
};
