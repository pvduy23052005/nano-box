"use client";

import ChatFooter from "@/src/features/chat/components/ChatFooter";
import ChatHeader from "@/src/features/chat/components/ChatHeader";
import ChatMain from "@/src/features/chat/components/ChatMain";
import ChatSidebar from "@/src/features/chat/components/ChatSidebar";
import { useReceiveMessageRead } from "@/src/features/chat/socket/useReceiveMessageRead";
import { useRoomStore } from "@/src/features/room/stores/useRoomStore";
import { cn } from "@/src/lib/utils";

export default function ChatPage() {
  useReceiveMessageRead();
  const activeRoomId = useRoomStore((state) => state.activeRoomId);

  return (
    <div className="flex flex-col sm:flex-row w-full h-full min-w-0 overflow-hidden bg-background">
      <ChatSidebar />

      <div
        className={cn(
          "flex-1 flex flex-col min-h-0 min-w-0 bg-card",
          activeRoomId ? "flex" : "hidden sm:flex",
        )}
      >
        <ChatHeader />
        <ChatMain />
        <ChatFooter />
      </div>
    </div>
  );
}
