import { useEffect } from "react";
import { useSocket } from "@/src/providers/SocketProvider";
import { PRESENCE_SOCKET_EVENTS } from "../types/event.types";
import { usePresenceStore } from "../stores/usePresenceStore";

export const useReceivePresence = () => {
  const { socket } = useSocket();
  const setInitialOnlineUsers = usePresenceStore(
    (state) => state.setInitialOnlineUsers,
  );
  const setUserOnline = usePresenceStore((state) => state.setUserOnline);
  const setUserOffline = usePresenceStore((state) => state.setUserOffline);

  useEffect(() => {
    if (!socket) return;

    const handleInitialOnlineUsers = (userIds: string[]) => {
      if (Array.isArray(userIds)) {
        setInitialOnlineUsers(userIds);
      }
    };

    const handleUserOnline = (data: { userId: string }) => {
      if (data?.userId) {
        setUserOnline(data.userId);
      }
    };

    const handleUserOffline = (data: { userId: string }) => {
      if (data?.userId) {
        setUserOffline(data.userId);
      }
    };

    socket.on(
      PRESENCE_SOCKET_EVENTS.INITIAL_ONLINE_USERS,
      handleInitialOnlineUsers,
    );
    socket.on(PRESENCE_SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
    socket.on(PRESENCE_SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);

    return () => {
      socket.off(
        PRESENCE_SOCKET_EVENTS.INITIAL_ONLINE_USERS,
        handleInitialOnlineUsers,
      );
      socket.off(PRESENCE_SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
      socket.off(PRESENCE_SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);
    };
  }, [socket, setInitialOnlineUsers, setUserOnline, setUserOffline]);
};
