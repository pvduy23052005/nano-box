import { useQuery } from "@apollo/client/react";
import { GET_FRIENDS_QUERY } from "../mutations/user.mutation";

export const useFriends = (searchQuery?: string) => {
  const { data, loading, error, refetch } = useQuery(GET_FRIENDS_QUERY, {
    variables: { search: searchQuery },
    fetchPolicy: "cache-and-network",
  });

  return {
    friends: data?.getFriends || [],
    loading,
    error,
    refetch,
  };
};
