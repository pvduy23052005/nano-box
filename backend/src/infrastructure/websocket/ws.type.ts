import { Socket, DefaultEventsMap } from 'socket.io';
import type { TokenPayload } from 'src/modules/auth/applications/dto/login.type';

export interface AppSocketData {
  user?: TokenPayload;
  userId?: string;
  relatedUserIds?: string[];
}

export type AuthenticatedSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  AppSocketData
>;

export const PRESENCE_SOCKET_EVENTS = {
  INITIAL_ONLINE_USERS: 'presence:initial_online_users',
  USER_ONLINE: 'presence:user_online',
  USER_OFFLINE: 'presence:user_offline',
  USER_LOGOUT: 'presence:logout',
} as const;
