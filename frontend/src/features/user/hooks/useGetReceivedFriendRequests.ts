import { useQuery } from "@apollo/client/react";
import { GET_RECEIVED_FRIEND_REQUESTS_QUERY } from "../mutations/user.mutation";

export interface ReceivedFriendRequestSender {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface ReceivedFriendRequestItem {
  id: string;
  createdAt?: unknown;
  sender: ReceivedFriendRequestSender;
}

export const useGetReceivedFriendRequests = () => {
  const { data, loading, error, refetch } = useQuery(
    GET_RECEIVED_FRIEND_REQUESTS_QUERY,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const requests: ReceivedFriendRequestItem[] =
    data?.getReceivedFriendRequests ?? [];

  return {
    requests,
    count: requests.length,
    loading,
    error,
    refetch,
  };
};
