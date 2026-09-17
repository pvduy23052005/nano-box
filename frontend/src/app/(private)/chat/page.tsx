"use client";

import ChatFooter from "@/src/features/chat/components/ChatFooter";
import ChatHeader from "@/src/features/chat/components/ChatHeader";
import ChatMain from "@/src/features/chat/components/ChatMain";
import ChatSidebar from "@/src/features/chat/components/ChatSidebar";
import { useReceiveMessageRead } from "@/src/features/chat/socket/useReceiveMessageRead";

export default function ChatPage() {
  useReceiveMessageRead();

  return (

    <div className="flex w-full h-full min-w-0 overflow-hidden">
      <ChatSidebar />

      <div className="flex-1 flex flex-col h-full min-w-0">
        <ChatHeader />
        <ChatMain />
        <ChatFooter />
      </div>
    </div>
  );
}
