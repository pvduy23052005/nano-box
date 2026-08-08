import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Message, MessageAvatar, MessageContent } from "@/src/components/ui/message";
import { Typography } from "@/src/components/ui/typography";
import { TypingUser } from "../stores/useTypingStore";

interface ChatTypingIndicatorProps {
  typingUsers: TypingUser[];
}

export default function ChatTypingIndicator({ typingUsers }: ChatTypingIndicatorProps) {
  if (!typingUsers.length) return null;

  const names = typingUsers
    .map((u) => u.name)
    .filter(Boolean)
    .join(", ");

  const text = names
    ? typingUsers.length === 1
      ? `${names} đang nhập...`
      : `${names} đang nhập...`
    : "Đang soạn tin nhắn...";

  return (
    <Message align="start" className="animate-in fade-in duration-200">
      <MessageAvatar>
        <Avatar className="size-8">
          <AvatarImage src="/avatar.png" />
          <AvatarFallback className="text-xs">
            {typingUsers[0]?.name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </MessageAvatar>
      <MessageContent>
        <div className="flex items-center gap-2">
          <div className="bg-muted rounded-2xl px-3.5 py-2.5 flex items-center gap-1.5 w-fit">
            <span className="size-1.5 rounded-full bg-foreground/60 animate-bounce [animation-delay:-0.3s]" />
            <span className="size-1.5 rounded-full bg-foreground/60 animate-bounce [animation-delay:-0.15s]" />
            <span className="size-1.5 rounded-full bg-foreground/60 animate-bounce" />
          </div>
          <Typography
            variant="caption"
            className="text-xs text-muted-foreground italic select-none"
          >
            {text}
          </Typography>
        </div>
      </MessageContent>
    </Message>
  );
}
