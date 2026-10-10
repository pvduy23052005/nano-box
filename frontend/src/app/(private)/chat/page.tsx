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
    <div className="relative flex flex-row w-full h-full min-w-0 overflow-hidden bg-background">
      <ChatSidebar />

      <div
        className={cn(
          "absolute inset-0 z-20 sm:relative sm:inset-auto sm:z-auto sm:flex-1 flex flex-col min-h-0 min-w-0 bg-card transition-transform duration-300 ease-out sm:transform-none shadow-xl sm:shadow-none",
          activeRoomId
            ? "translate-x-0 pointer-events-auto"
            : "translate-x-full sm:translate-x-0 pointer-events-none sm:pointer-events-auto",
        )}
      >
        <ChatHeader />
        <ChatMain />
        <ChatFooter />
      </div>
    </div>
  );
}
