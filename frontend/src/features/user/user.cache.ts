import { ApolloCache } from "@apollo/client";
import { GET_RECEIVED_FRIEND_REQUESTS_QUERY } from "./mutations/user.mutation";
import { GetReceivedFriendRequestsQuery } from "@/src/types/graphql/graphql";
import { ReceivedFriendRequestItem } from "./hooks/useGetReceivedFriendRequests";

export const appendFriendRequestToCache = (
  cache: ApolloCache,
  newRequest: ReceivedFriendRequestItem
) => {
  cache.updateQuery<GetReceivedFriendRequestsQuery>(
    { query: GET_RECEIVED_FRIEND_REQUESTS_QUERY },
    (data) => {
      const currentRequests = data?.getReceivedFriendRequests || [];

      if (currentRequests.some((request) => request.id === newRequest.id)) {
        return data;
      }

      const newCacheItem = {
        id: newRequest.id,
        createdAt: newRequest.createdAt ?? new Date().toISOString(),
        sender: {
          id: newRequest.sender.id,
          name: newRequest.sender.name,
          email: newRequest.sender.email,
          avatar: newRequest.sender.avatar ?? null,
        },
      };

      return {
        ...data,
        getReceivedFriendRequests: [newCacheItem, ...currentRequests],
      };
    }
  );
};
