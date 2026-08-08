import { Socket, DefaultEventsMap } from 'socket.io';
import type { TokenPayload } from 'src/modules/auth/applications/dto/login.type';

export interface AppSocketData {
  user?: TokenPayload;
  userId?: string;
}

export interface AuthenticatedSocket
  extends Socket<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    AppSocketData
  > {}
