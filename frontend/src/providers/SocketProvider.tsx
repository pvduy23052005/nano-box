"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  disconnect: () => void;
  connect: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  disconnect: () => {},
  connect: () => {},
});

const getSocketUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (typeof window !== "undefined") {
    return window.location.port === "3000" ? "http://localhost:5050" : "";
  }
  return "http://localhost:5050";
};

const socketInstance =
  typeof window !== "undefined"
    ? io(getSocketUrl() || undefined, {
        withCredentials: true,
        transports: ["websocket"],
        autoConnect: false,
      })
    : null;

export const disconnectSocket = () => {
  if (socketInstance?.connected) {
    socketInstance.disconnect();
  }
};

export const connectSocket = () => {
  if (socketInstance && !socketInstance.connected) {
    socketInstance.connect();
  }
};

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
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketInstance,
        isConnected,
        disconnect: disconnectSocket,
        connect: connectSocket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
