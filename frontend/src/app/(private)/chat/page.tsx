"use client";

import ChatFooter from "@/src/features/chat/components/ChatFooter";
import ChatHeader from "@/src/features/chat/components/ChatHeader";
import ChatMain from "@/src/features/chat/components/ChatMain";
import ChatMessage, {
  ChatMessageProps,
} from "@/src/features/chat/components/ChatMessage";
import ChatSidebar from "@/src/features/chat/components/ChatSidebar";
import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessage] = useState<
    (ChatMessageProps & { id: number })[]
  >([
    {
      id: 1,
      isMe: true,
      content:
        "Chào bạn, bạn có thể giúp mình xem qua đoạn code này được không?",
      avatar: "/avatars/10.png",
    },
    {
      id: 2,
      isMe: false,
      content: "Chào bạn! Rất sẵn lòng, bạn gửi đoạn code qua nhé.",
      avatar: "/avatars/02.png",
    },
    {
      id: 3,
      isMe: true,
      content:
        "Mình đang làm giao diện chat bằng React và Tailwind CSS nhưng bị vướng phần scroll.",
      avatar: "/avatars/10.png",
    },
    {
      id: 4,
      isMe: false,
      content:
        "Vấn đề cụ thể là gì vậy? Màn hình bị giật (jumping) khi tải tin nhắn cũ hay không tự cuộn xuống cuối?",
      avatar: "/avatars/02.png",
    },
    {
      id: 5,
      isMe: true,
      content:
        "Đúng rồi, khi có tin nhắn mới gửi đến nó không tự động cuộn xuống dưới cùng ấy.",
      avatar: "/avatars/10.png",
    },
    {
      id: 6,
      isMe: false,
      content:
        "À, vấn đề đó bạn có thể xử lý bằng `useEffect` kết hợp với `useRef` trỏ vào phần tử cuối danh sách.",
      avatar: "/avatars/02.png",
    },
    {
      id: 7,
      isMe: false,
      content:
        "Hoặc nếu bạn dùng bộ UI của shadcn/ui thì có thể tham khảo component MessageScroller nhé!",
      avatar: "/avatars/02.png",
    },
    {
      id: 8,
      isMe: true,
      content:
        "Hay quá! Để mình thử dùng `scrollIntoView({ behavior: 'smooth' })` xem sao.",
      avatar: "/avatars/10.png",
    },
    {
      id: 9,
      isMe: true,
      content: "Cảm ơn bạn nhiều nhé, mượt hơn hẳn rồi!",
      avatar: "/avatars/10.png",
    },
    {
      id: 10,
      isMe: false,
      content:
        "Không có gì đâu! Cần trợ giúp gì thêm cứ bảo mình nhé. Chúc bạn code vui vẻ! 🚀",
      avatar: "/avatars/02.png",
    },
  ]);

  return (
    <div className="flex w-full h-full">
      <ChatSidebar />


      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <ChatMain />
        <ChatFooter />
      </div>
    </div>
  );
}
