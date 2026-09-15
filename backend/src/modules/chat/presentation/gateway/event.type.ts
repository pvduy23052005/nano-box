export const CHAT_SOCKET_EVENTS = {
  RECEIVE_MESSAGE: 'receive:message',
  CLIENT_SEND_TYPING: 'client:send:typing',
  SERVER_SEND_TYPING: 'server:send:typing',
};

export type TypingPayload = {
  roomId: string;
  userId?: string;
  name?: string;
  isTyping: boolean;
};
