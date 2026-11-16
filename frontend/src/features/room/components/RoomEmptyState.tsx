import { MessageSquareDashed } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/src/components/ui/empty";

interface RoomEmptyStateProps {
  message: string;
}

export default function RoomEmptyState({ message }: RoomEmptyStateProps) {
  return (
    <Empty className="py-2 sm:py-12 px-3 sm:px-4 gap-2 sm:gap-3 shrink-0 border-0">
      <EmptyHeader className="flex-row sm:flex-col gap-2 sm:gap-3">
        <EmptyMedia
          variant="icon"
          className="mb-0 size-7 sm:size-12 rounded-full bg-muted/60 text-muted-foreground/80 [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-6"
        >
          <MessageSquareDashed className="stroke-[1.5]" />
        </EmptyMedia>
        <EmptyDescription className="text-xs text-muted-foreground whitespace-nowrap sm:whitespace-normal max-w-[200px]">
          {message}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
