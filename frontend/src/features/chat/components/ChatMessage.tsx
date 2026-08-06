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

  const isHtml = /<[a-z][\s\S]*>/i.test(chatProp.content);

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
              "break-words [overflow-wrap:anywhere]",
              !isHtml && "whitespace-pre-wrap",
              isHtml && "chat-html-content",
              chatProp.isMe ? "rounded-br-none" : "rounded-bl-none"
            )}
          >
            {isHtml ? (
              <div dangerouslySetInnerHTML={{ __html: chatProp.content }} />
            ) : (
              chatProp.content
            )}
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
