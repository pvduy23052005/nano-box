"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5050";

const socketInstance =
  typeof window !== "undefined"
    ? io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket"],
        autoConnect: false,
      })
    : null;

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(
    socketInstance?.connected ?? false,
  );

  useEffect(() => {
    if (!socketInstance) return;

    socketInstance.connect();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);

    return () => {
      socketInstance.off("connect", onConnect);
      socketInstance.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketInstance, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
