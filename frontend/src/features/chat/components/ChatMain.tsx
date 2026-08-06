"use client";

import { useEffect, useRef, useMemo } from "react";
import { useGetMessages } from "../hooks/useGetMessages";
import ChatLoading from "./ChatLoading";
import ChatMessage from "./ChatMessage";
import { useReceiveMessage } from "../socket/useReceiveMessage";
import { Message, MessageGroup } from "../types/chat.types";

export default function ChatMain() {
  const { messages, isLoading } = useGetMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useReceiveMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const messageGroups = useMemo(() => {
    return messages.reduce<MessageGroup[]>(
      (groups: MessageGroup[], message: Message) => {
        const lastGroup = groups[groups.length - 1];
        if (lastGroup && lastGroup.senderId === message.senderId) {
          lastGroup.messages.push(message);
        } else {
          groups.push({
            id: message.id,
            isMe: message.isMe,
            senderId: message.senderId,
            avatar: message.avatar,
            messages: [message],
          });
        }
        return groups;
      },
      [],
    );
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col gap-4 px-3 py-3 overflow-y-auto">
      {isLoading ? (
        <ChatLoading />
      ) : (
        messageGroups.map((group, index) => (
          <ChatMessage
            key={group.id}
            isLastGroup={index === messageGroups.length - 1}
            {...group}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
