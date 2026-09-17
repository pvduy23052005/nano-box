import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/src/components/ui/message";
import { Typography } from "@/src/components/ui/typography";
import { TypingUser } from "../stores/useTypingStore";

interface ChatTypingIndicatorProps {
  typingUsers: TypingUser[];
}

export default function ChatTypingIndicator({
  typingUsers,
}: ChatTypingIndicatorProps) {
  if (!typingUsers.length) return null;

  const names = typingUsers
    .map((user) => user.nameTyping)
    .filter(Boolean)
    .join(", ");

  const text = names
    ? typingUsers.length === 1
      ? `${names} đang nhập...`
      : `${names} đang nhập...`
    : "Đang soạn tin nhắn...";

  return (
    <Message align="start" className="animate-in fade-in duration-200">
      <MessageAvatar className="min-w-0 bg-transparent mb-1">
        <Avatar className="size-6">
          <AvatarImage
            src={typingUsers[0]?.avatarTyping || "/images/default-avatar.webp"}
          />
          <AvatarFallback className="text-[10px]">
            {typingUsers[0]?.nameTyping?.[0]?.toUpperCase() || "U"}
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
