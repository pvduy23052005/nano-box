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
import { Typography } from "@/src/components/ui/typography";

export interface ChatMessageProps {
  id?: string;
  content: string;
  avatar?: string;
  isMe: boolean;
  isLastMessage?: boolean;
}

export default function ChatMessage(chatProp: ChatMessageProps) {
  const isSending = chatProp.id?.startsWith("temp-");
  const showStatus = isSending || chatProp.isLastMessage;

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
              "whitespace-pre-wrap break-words [overflow-wrap:anywhere]",
              chatProp.isMe ? "rounded-br-none" : "rounded-bl-none"
            )}
          >
            {chatProp.content}
          </BubbleContent>
        </Bubble>
        {chatProp.isMe && showStatus && (
          <Typography variant="caption" className="text-right">
            {isSending ? "Đang gửi..." : "Đã gửi"}
          </Typography>
        )}
      </MessageContent>
    </Message>
  );
}
