export enum RealtimeEventType {
  EMIT = 'emit',
  SOCKETS_LEAVE = 'sockets_leave',
}

export type RealtimeEventMessage =
  | {
      type: RealtimeEventType.EMIT;
      rooms: string[];
      event: string;
      payload: unknown;
    }
  | {
      type: RealtimeEventType.SOCKETS_LEAVE;
      rooms: string[];
      leaveRoomId: string;
    };
