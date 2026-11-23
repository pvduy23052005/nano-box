import { useEffect } from "react";
import { useApolloClient } from "@apollo/client/react";
import { useSocket } from "@/src/providers/SocketProvider";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { appendFriendRequestToCache } from "../user.cache";
import { ReceivedFriendRequestItem } from "../hooks/useGetReceivedFriendRequests";

export const useReceiveFriendRequest = () => {
  const client = useApolloClient();
  const { socket } = useSocket();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleReceiveRequest = (newRequest: ReceivedFriendRequestItem) => {
      appendFriendRequestToCache(client.cache, newRequest);
    };

    socket.on("friend.request", handleReceiveRequest);

    return () => {
      socket.off("friend.request", handleReceiveRequest);
    };
  }, [client, socket, user?.id]);
};
