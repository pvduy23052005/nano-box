import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
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
    <div className="px-4 pt-4 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto">
      <Avatar className="size-6">
        <AvatarImage
          src={typingUsers[0]?.avatarTyping || "/images/default-avatar.webp"}
        />
        <AvatarFallback className="text-[10px] bg-muted font-medium">
          {typingUsers[0]?.nameTyping?.[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <span className="size-1.5 rounded-full bg-primary animate-bounce" />
        </div>
        <Typography
          variant="caption"
          className="text-xs text-muted-foreground select-none"
        >
          {text}
        </Typography>
      </div>
    </div>
  );
}
