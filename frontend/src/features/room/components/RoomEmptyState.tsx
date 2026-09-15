import { MessageSquareDashed } from "lucide-react";
import { Typography } from "@/src/components/ui/typography";

interface RoomEmptyStateProps {
  message: string;
}

export default function RoomEmptyState({ message }: RoomEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-muted-foreground gap-3">
      <div className="flex items-center justify-center size-12 rounded-full bg-muted/60 text-muted-foreground/80">
        <MessageSquareDashed className="size-6 stroke-[1.5]" />
      </div>
      <Typography variant="small" className="text-xs text-muted-foreground max-w-[200px]">
        {message}
      </Typography>
    </div>
  );
}
