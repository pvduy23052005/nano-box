import { BellOff } from "lucide-react";
import { Typography } from "@/src/components/ui/typography";

interface NotificationEmptyStateProps {
  title?: string;
  description?: string;
}

export default function NotificationEmptyState({
  title = "Chưa có thông báo nào",
  description = "Các thông báo và tin nhắn mới sẽ hiển thị tại đây",
}: NotificationEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="flex items-center justify-center size-12 rounded-full bg-muted/50 mb-3 text-muted-foreground/80 ring-1 ring-border/50">
        <BellOff className="size-6 stroke-[1.5]" />
      </div>
      <Typography variant="small" className="text-xs font-semibold text-foreground">
        {title}
      </Typography>
      <Typography
        variant="caption"
        className="text-[11px] text-muted-foreground mt-1 max-w-[220px]"
      >
        {description}
      </Typography>
    </div>
  );
}
