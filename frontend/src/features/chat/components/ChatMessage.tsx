import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/src/components/ui/message";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { cn } from "@/src/lib/utils";
import { Bubble, BubbleContent } from "@/src/components/ui/bubble";

export interface ChatMessageProps {
  content: string;
  avatar?: string;
  isMe: boolean;
}

export default function ChatMessage(chatProp: ChatMessageProps) {
  return (
    <Message align={chatProp.isMe ? "end" : "start"}>
      {!chatProp.isMe && (
        <MessageAvatar>
          <Avatar>
            <AvatarImage src={chatProp.avatar} />
            <AvatarFallback>user</AvatarFallback>
          </Avatar>
        </MessageAvatar>
      )}
      <MessageContent>
        <Bubble variant={chatProp.isMe ? "default" : "muted"}>
          <BubbleContent
            className={cn(
              chatProp.isMe ? "rounded-br-none" : "rounded-bl-none"
            )}
          >
            {chatProp.content}
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}
