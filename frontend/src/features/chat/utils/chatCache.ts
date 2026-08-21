import { ApolloCache } from "@apollo/client";
import { DocumentNode } from "graphql";
import { Message } from "../types/chat.types";

interface GetMessagesData {
  getMessages: Message[];
}

export const appendMessageToCache = (
  cache: ApolloCache,
  query: DocumentNode,
  newMessage: Omit<Message, "isMe"> & { isMe?: boolean },
  tempId?: string
): void => {
  const normalizedMessage: Message = { ...newMessage, isMe: newMessage.isMe ?? false };

  cache.updateQuery<GetMessagesData>({ query }, (existing) => {
    if (!existing?.getMessages) {
      return { getMessages: [normalizedMessage] };
    }

    if (tempId) {
      const isTempExist = existing.getMessages.some((msg: Message) => msg.id === tempId);
      if (isTempExist) {
        return {
          getMessages: existing.getMessages.map((msg: Message) =>
            msg.id === tempId ? normalizedMessage : msg
          ),
        };
      }
    }

    const isExist = existing.getMessages.some((msg) => msg.id === newMessage.id);
    if (isExist) return existing;

    return {
      getMessages: [...existing.getMessages, normalizedMessage],
    };
  });
};
