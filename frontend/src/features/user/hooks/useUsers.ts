import { useQuery } from "@apollo/client/react";
import { GET_USERS_QUERY } from "../mutations/user.mutation";

export const useUsers = (searchQuery?: string) => {
  const { data, loading, error, refetch } = useQuery(GET_USERS_QUERY, {
    variables: { search: searchQuery },
    fetchPolicy: "cache-and-network",
  });

  return {
    users: data?.getUsers || [],
    loading,
    error,
    refetch,
  };
};
