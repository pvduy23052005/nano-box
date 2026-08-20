import { ApolloCache } from "@apollo/client";
import { DocumentNode } from "graphql";
import { Message } from "../types/chat.types";

interface GetMessagesData {
  getMessages: Message[];
}

export const appendMessageToCache = (
  cache: ApolloCache,
  query: DocumentNode,
  newMessage: Message,
  tempId?: string
): void => {
  cache.updateQuery<GetMessagesData>({ query }, (existing) => {
    if (!existing?.getMessages) {
      return { getMessages: [newMessage] };
    }

    if (tempId) {
      const isTempExist = existing.getMessages.some((msg: Message) => msg.id === tempId);
      if (isTempExist) {
        return {
          getMessages: existing.getMessages.map((msg: Message) =>
            msg.id === tempId ? newMessage : msg
          ),
        };
      }
    }

    const isExist = existing.getMessages.some((msg) => msg.id === newMessage.id);
    if (isExist) return existing;

    console.log("newMessage", newMessage);
    console.log("existing.getMessages", existing.getMessages);
    return {
      getMessages: [...existing.getMessages, newMessage],
    };
  });
};
