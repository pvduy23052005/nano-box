import { Skeleton } from "@/src/components/ui/skeleton";
import { Message, MessageAvatar, MessageContent } from "@/src/components/ui/message";

export default function ChatLoading() {
  return (
    <div className="flex flex-col gap-4 p-4 w-full h-full flex-1">
      <Message align="start">
        <MessageAvatar>
          <Skeleton className="h-10 w-10 rounded-full" />
        </MessageAvatar>
        <MessageContent>
          <Skeleton className="h-12 w-[250px] rounded-2xl rounded-bl-none" />
        </MessageContent>
      </Message>

      <Message align="end">
        <MessageContent>
          <Skeleton className="h-10 w-[180px] rounded-2xl rounded-br-none" />
        </MessageContent>
      </Message>

      <Message align="start">
        <MessageAvatar>
          <Skeleton className="h-10 w-10 rounded-full" />
        </MessageAvatar>
        <MessageContent>
          <Skeleton className="h-16 w-[300px] rounded-2xl rounded-bl-none" />
        </MessageContent>
      </Message>
      
      <Message align="end">
        <MessageContent>
          <Skeleton className="h-20 w-[220px] rounded-2xl rounded-br-none" />
        </MessageContent>
      </Message>
    </div>
  );
}
