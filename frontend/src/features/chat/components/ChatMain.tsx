"use client";

import { useEffect, useRef } from "react";
import { useGetMessages } from "../hooks/useGetMessages";
import ChatLoading from "./ChatLoading";
import ChatMessage from "./ChatMessage";

export default function ChatMain() {
  const { messages, isLoading } = useGetMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col gap-4 px-3 overflow-auto">
      {isLoading ? (
        <ChatLoading />
      ) : (
        messages.map((message, index) => (
          <ChatMessage 
            key={message.id} 
            isLastMessage={index === messages.length - 1}
            {...message} 
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
