"use client";

import ChatFooter from "@/src/features/chat/components/ChatFooter";
import ChatHeader from "@/src/features/chat/components/ChatHeader";
import ChatMain from "@/src/features/chat/components/ChatMain";
import ChatSidebar from "@/src/features/chat/components/ChatSidebar";

export default function ChatPage() {
  return (
    <div className="flex w-full h-full">
      {/* <ChatSidebar /> */}

      <div className="flex-1 flex flex-col h-full">
        <ChatHeader />
        <ChatMain />
        <ChatFooter />
      </div>
    </div>
  );
}
