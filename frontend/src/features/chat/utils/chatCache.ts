import { ApolloCache } from "@apollo/client";
import { DocumentNode } from "graphql";
import { GRAPHQL_TYPENAMES } from "@/src/core/constants/graphql.constant";
import { Message, MessageReaction, PAGINATION_LIMIT } from "../types/chat.types";

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
  newMessage: Omit<Message, "isMe"> & { isMe?: boolean; __typename?: string },
  tempId?: string,
  roomId?: string | null,
): void => {
  const normalizedMessage: Message = {
    ...newMessage,
    isMe: newMessage.isMe ?? false,
    reactions: newMessage.reactions ?? [],
    attachments: newMessage.attachments ?? [],
    isSystem: newMessage.isSystem ?? (newMessage.senderId === "system"),
    __typename:
      (newMessage as { __typename?: string }).__typename ??
      GRAPHQL_TYPENAMES.CHAT_PAYLOAD,
  } as Message;
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
        return existing;
      }

      const currentItems = existing.getMessages.items || [];

      if (tempId) {
        const isTempExist = currentItems.some((message: Message) => message.id === tempId);
        if (isTempExist) {
          return {
            getMessages: {
              ...existing.getMessages,
              items: currentItems.map((message: Message) =>
                message.id === tempId ? normalizedMessage : message,
              ),
            },
          };
        }
      }

      const isExist = currentItems.some((message) => message.id === newMessage.id);
      if (isExist) return existing;

      return {
        getMessages: {
          ...existing.getMessages,
          items: [...currentItems, normalizedMessage],
        },
      };
    },
  );
};

export const updateMessageReactionInCache = (
  cache: ApolloCache,
  query: DocumentNode,
  roomId: string,
  messageId: string,
  reactions: Message["reactions"],
): void => {
  try {
    const identifiedId =
      cache.identify({
        __typename: GRAPHQL_TYPENAMES.CHAT_PAYLOAD,
        id: messageId,
      }) || `${GRAPHQL_TYPENAMES.CHAT_PAYLOAD}:${messageId}`;

    cache.modify({
      id: identifiedId,
      fields: {
        reactions() {
          return reactions || [];
        },
      },
    });
  } catch {
  }

  try {
    cache.updateQuery<GetMessagesData>(
      {
        query,
        variables: {
          limit: PAGINATION_LIMIT,
          roomId,
        },
      },
      (existing) => {
        if (!existing?.getMessages?.items) return existing;
        return {
          getMessages: {
            ...existing.getMessages,
            items: existing.getMessages.items.map((item) =>
              item.id === messageId
                ? { ...item, reactions: reactions || [] }
                : item,
            ),
          },
        };
      },
    );
  } catch {
  }
};

export const getMessageFromCache = (
  cache: ApolloCache,
  query: DocumentNode,
  roomId: string,
  messageId: string,
): Message | undefined => {
  const data = cache.readQuery<GetMessagesData>({
    query,
    variables: {
      limit: PAGINATION_LIMIT,
      roomId,
    },
  });
  return data?.getMessages?.items?.find((item) => item.id === messageId);
};

export const computeOptimisticReactions = (
  currentReactions: MessageReaction[],
  emoji: string,
  userId: string,
): MessageReaction[] => {
  const safeReactions = Array.isArray(currentReactions) ? currentReactions : [];
  const cleanEmoji = emoji.trim();
  if (!cleanEmoji || !userId) return safeReactions;

  const clonedReactions = safeReactions.map((reaction) => ({
    emoji: reaction.emoji,
    userIds: [...reaction.userIds],
  }));

  const existingReactionGroup = clonedReactions.find(
    (reaction) => reaction.emoji === cleanEmoji,
  );
  const hasReactedWithThisEmoji =
    existingReactionGroup?.userIds.includes(userId);

  const remainingReactions = clonedReactions
    .map((reaction) => ({
      emoji: reaction.emoji,
      userIds: reaction.userIds.filter(
        (currentUserId) => currentUserId !== userId,
      ),
    }))
    .filter((reaction) => reaction.userIds.length > 0);

  if (hasReactedWithThisEmoji) {
    return remainingReactions;
  }

  const targetGroup = remainingReactions.find(
    (reaction) => reaction.emoji === cleanEmoji,
  );
  if (targetGroup) {
    targetGroup.userIds.push(userId);
  } else {
    remainingReactions.push({
      emoji: cleanEmoji,
      userIds: [userId],
    });
  }

  return remainingReactions;
};
