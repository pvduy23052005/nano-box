import ChatMessage from "./ChatMessage";

export default function ChatMain() {
  const messages = [
    {
      id: "1",
      content: "Chào bạn! Mình có thể giúp gì cho bạn hôm nay?",
      avatar: "/avatars/02.png",
      isMe: false,
    },
  ];

  return (
    <div className="flex-1 flex flex-col gap-4 px-3 overflow-auto">
      {messages.map((message) => (
        <ChatMessage key={message.id} {...message} />
      ))}
    </div>
  );
}
