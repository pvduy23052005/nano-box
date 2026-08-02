import { useGetMessages } from "../hooks/useGetMessages";
import ChatLoading from "./ChatLoading";
import ChatMessage from "./ChatMessage";

export default function ChatMain() {
  const { messages, isLoading } = useGetMessages();

  return (
    <div className="flex-1 flex flex-col gap-4 px-3 overflow-auto">
      {isLoading ? (
        <ChatLoading />
      ) : (
        messages.map((message) => <ChatMessage key={message.id} {...message} />)
      )}
    </div>
  );
}
