import { useEffect } from "react";
import { useApolloClient } from "@apollo/client/react";
import { useSocket } from "@/src/providers/SocketProvider";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { appendNotificationToCache } from "../notification.cache";
import {
  NotificationItem,
  NOTIFICATION_SOCKET_EVENTS,
} from "../types/notification.types";

export const useReceiveNotification = () => {
  const client = useApolloClient();
  const { socket } = useSocket();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleReceiveNotification = (newNotification: NotificationItem) => {
      if (newNotification.recipientId !== user.id) return;

      appendNotificationToCache(client.cache, newNotification);
    };

    socket.on(
      NOTIFICATION_SOCKET_EVENTS.RECEIVE_NOTIFICATION,
      handleReceiveNotification,
    );

    return () => {
      socket.off(
        NOTIFICATION_SOCKET_EVENTS.RECEIVE_NOTIFICATION,
        handleReceiveNotification,
      );
    };
  }, [client, socket, user?.id]);
};
