export const CHAT_SOCKET_EVENTS = {
  RECEIVE_MESSAGE: 'receive:message',
  CLIENT_SEND_TYPING: 'client:send:typing',
  SERVER_SEND_TYPING: 'server:send:typing',
  UPDATE_MESSAGE_REACTION: 'update:message:reaction',
  CLIENT_JOIN_ROOM: 'client:join:room',
  CLIENT_LEAVE_ROOM: 'client:leave:room',
};

export type TypingPayload = {
  roomId: string;
  userId?: string;
  name?: string;
  avatar?: string;
  isTyping: boolean;
};

export type RoomActionPayload = {
  roomId: string;
};
