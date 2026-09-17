import { MessageSquareDashed } from "lucide-react";
import { Typography } from "@/src/components/ui/typography";

interface RoomEmptyStateProps {
  message: string;
}

export default function RoomEmptyState({ message }: RoomEmptyStateProps) {
  return (
    <div className="flex flex-row sm:flex-col items-center justify-center py-2 sm:py-12 px-3 sm:px-4 text-center text-muted-foreground gap-2 sm:gap-3 shrink-0">
      <div className="flex items-center justify-center size-7 sm:size-12 rounded-full bg-muted/60 text-muted-foreground/80 shrink-0">
        <MessageSquareDashed className="size-4 sm:size-6 stroke-[1.5]" />
      </div>
      <Typography variant="small" className="text-xs text-muted-foreground whitespace-nowrap sm:whitespace-normal max-w-[200px]">
        {message}
      </Typography>
    </div>
  );
}
