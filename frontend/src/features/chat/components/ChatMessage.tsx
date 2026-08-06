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
import { BubbleGroup, Bubble, BubbleContent } from "@/src/components/ui/bubble";
import { Typography } from "@/src/components/ui/typography";
import DOMPurify from "isomorphic-dompurify";
import { MessageGroup } from "../types/chat.types";

export interface ChatMessageGroupProps extends MessageGroup {
  isLastGroup?: boolean;
}

export default function ChatMessage({
  isMe,
  avatar,
  messages,
  isLastGroup,
}: ChatMessageGroupProps) {
  const lastMessage = messages[messages.length - 1];
  const isSending = lastMessage?.id?.startsWith("temp-");
  const showStatus = isMe && (isSending || isLastGroup);

  return (
    <Message align={isMe ? "end" : "start"}>
      {!isMe && (
        <MessageAvatar>
          <Avatar>
            <AvatarImage src={avatar} />
            <AvatarFallback>user</AvatarFallback>
          </Avatar>
        </MessageAvatar>
      )}
      <MessageContent>
        <BubbleGroup>
          {messages.map((msg) => {
            const cleanContent = DOMPurify.sanitize(msg.content);
            return (
              <Bubble key={msg.id} variant={isMe ? "default" : "muted"}>
                <BubbleContent>
                  <div
                    className="w-max max-w-full"
                    dangerouslySetInnerHTML={{
                      __html: cleanContent,
                    }}
                  />
                </BubbleContent>
              </Bubble>
            );
          })}
        </BubbleGroup>
        {showStatus && (
          <Typography variant="caption" className="text-right">
            {isSending ? "Đang gửi..." : "Đã gửi"}
          </Typography>
        )}
      </MessageContent>
    </Message>
  );
}
