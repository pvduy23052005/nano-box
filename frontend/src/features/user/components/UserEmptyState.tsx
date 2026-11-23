import { LucideIcon, Users, UserCheck, Inbox, Send } from "lucide-react";
import { Typography } from "@/src/components/ui/typography";
import { cn } from "@/src/lib/utils";

export type UserTabType = "all" | "friends" | "received" | "sent";

const TAB_DEFAULTS: Record<
  UserTabType,
  {
    icon: LucideIcon;
    title: string;
    description: string;
  }
> = {
  all: {
    icon: Users,
    title: "Không tìm thấy người dùng nào",
    description: "Hãy thử tìm kiếm với từ khóa khác hoặc quay lại sau.",
  },
  friends: {
    icon: UserCheck,
    title: "Chưa có bạn bè nào",
    description:
      'Hãy kết nối với mọi người từ tab "Tất cả" để bắt đầu trò chuyện và chia sẻ.',
  },
  received: {
    icon: Inbox,
    title: "Không có lời mời kết bạn nào",
    description:
      "Khi có người gửi lời mời kết bạn cho bạn, yêu cầu sẽ xuất hiện tại đây để bạn phản hồi.",
  },
  sent: {
    icon: Send,
    title: "Chưa gửi lời mời nào",
    description:
      'Khi bạn gửi lời mời kết bạn cho người khác từ tab "Tất cả", các yêu cầu sẽ xuất hiện tại đây.',
  },
};

export interface UserEmptyStateProps {
  tab?: UserTabType;
  icon?: LucideIcon;
  title?: string;
  description?: string;
  className?: string;
}

export default function UserEmptyState({
  tab = "all",
  icon,
  title,
  description,
  className,
}: UserEmptyStateProps) {
  const defaults = TAB_DEFAULTS[tab] || TAB_DEFAULTS.all;
  const Icon = icon || defaults.icon;
  const displayTitle = title || defaults.title;
  const displayDescription = description || defaults.description;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[320px] p-8 text-center bg-card/40 border border-dashed rounded-2xl transition-all",
        className
      )}
    >
      <div className="flex items-center justify-center size-14 mb-4 rounded-full bg-primary/10 text-primary">
        <Icon className="size-7" />
      </div>
      <Typography variant="h4" className="font-semibold text-foreground mb-1">
        {displayTitle}
      </Typography>
      <Typography variant="muted" className="max-w-sm text-sm">
        {displayDescription}
      </Typography>
    </div>
  );
}
