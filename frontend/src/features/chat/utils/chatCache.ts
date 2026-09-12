import { ApolloCache } from "@apollo/client";
import { DocumentNode } from "graphql";
import { Message, PAGINATION_LIMIT } from "../types/chat.types";

interface GetMessagesData {
  getMessages: {
    items: Message[];
    hasMore: boolean;
    nextCursor: string | null;
  };
}

export const appendMessageToCache = (
  cache: ApolloCache,
  query: DocumentNode,
  newMessage: Omit<Message, "isMe"> & { isMe?: boolean },
  tempId?: string,
  roomId?: string | null,
): void => {
  const normalizedMessage: Message = { ...newMessage, isMe: newMessage.isMe ?? false };
  const targetRoomId = roomId ?? newMessage.roomId ?? null;
  if (!targetRoomId) return;

  cache.updateQuery<GetMessagesData>(
    {
      query,
      variables: {
        limit: PAGINATION_LIMIT,
        roomId: targetRoomId,
      },
    },
    (existing) => {
    if (!existing?.getMessages) {
      return {
        getMessages: {
          items: [normalizedMessage],
          hasMore: false,
          nextCursor: null,
        },
      };
    }

    const currentItems = existing.getMessages.items || [];

    if (tempId) {
      const isTempExist = currentItems.some((msg: Message) => msg.id === tempId);
      if (isTempExist) {
        return {
          getMessages: {
            ...existing.getMessages,
            items: currentItems.map((msg: Message) =>
              msg.id === tempId ? normalizedMessage : msg
            ),
          },
        };
      }
    }

    const isExist = currentItems.some((msg) => msg.id === newMessage.id);
    if (isExist) return existing;

    return {
      getMessages: {
        ...existing.getMessages,
        items: [...currentItems, normalizedMessage],
      },
    };
  });
};
