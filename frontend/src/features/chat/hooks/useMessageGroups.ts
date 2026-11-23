import { useMemo } from "react";
import { Message, MessageGroup } from "../types/chat.types";

export function useMessageGroups(messages: Message[]): MessageGroup[] {
  return useMemo(() => {
    const seenMessageIds = new Set<string>();

    return messages.reduce<MessageGroup[]>(
      (groups: MessageGroup[], message: Message, index: number) => {
        if (message.id) {
          if (seenMessageIds.has(message.id)) {
            return groups;
          }
          seenMessageIds.add(message.id);
        }

        const isSystem = Boolean(
          message.isSystem || message.senderId === "system",
        );
        if (isSystem) {
          groups.push({
            id: message.id
              ? `system-${message.id}`
              : `system-${message.createdAt || index}`,
            isMe: false,
            senderId: "system",
            isSystem: true,
            messages: [message],
          });
          return groups;
        }

        const lastGroup = groups[groups.length - 1];
        const lastMessage = lastGroup?.messages[lastGroup.messages.length - 1];

        const isWithinTimeThreshold = () => {
          if (!lastMessage?.createdAt || !message.createdAt) return true;
          const prevTime = new Date(lastMessage.createdAt).getTime();
          const currTime = new Date(message.createdAt).getTime();
          if (isNaN(prevTime) || isNaN(currTime)) return true;
          return Math.abs(currTime - prevTime) <= 5 * 60 * 1000;
        };

        const isSameSender =
          lastGroup &&
          !lastGroup.isSystem &&
          lastGroup.isMe === message.isMe &&
          (!lastGroup.senderId ||
            !message.senderId ||
            lastGroup.senderId === message.senderId) &&
          isWithinTimeThreshold();

        if (isSameSender) {
          if (!lastGroup.avatar && (message.senderAvatar || message.avatar)) {
            lastGroup.avatar = message.senderAvatar || message.avatar;
          }
          lastGroup.messages.push(message);
        } else {
          const groupId = message.id
            ? `group-${message.senderId || (message.isMe ? "me" : "other")}-${message.id}`
            : `group-${message.senderId || (message.isMe ? "me" : "other")}-${message.createdAt || index}`;
          groups.push({
            id: groupId,
            isMe: message.isMe,
            senderId: message.senderId,
            avatar: message.senderAvatar || message.avatar,
            senderAvatar: message.senderAvatar || message.avatar,
            senderName: message.senderName,
            messages: [message],
          });
        }
        return groups;
      },
      [],
    );
  }, [messages]);
}
