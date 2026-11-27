import type { DefaultEventsMap, Socket } from 'socket.io';

export interface SocketTokenPayload {
  id: string;
  email: string;
}

export interface RealtimeSocketData {
  user?: SocketTokenPayload;
  userId?: string;
}

export type AuthenticatedSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  RealtimeSocketData
>;
