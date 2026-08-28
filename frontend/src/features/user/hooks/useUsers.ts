import { useQuery } from "@apollo/client/react";
import { GET_USERS_QUERY } from "../mutations/user.mutation";

export const useUsers = () => {
  const { data, loading, error, refetch } = useQuery(GET_USERS_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  return {
    users: data?.getUsers || [],
    loading,
    error,
    refetch,
  };
};
