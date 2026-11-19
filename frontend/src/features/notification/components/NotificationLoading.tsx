import { Skeleton } from "@/src/components/ui/skeleton";

interface NotificationLoadingProps {
  count?: number;
}

export default function NotificationLoading({
  count = 3,
}: NotificationLoadingProps) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-card shadow-xs"
        >
          <Skeleton className="size-9 shrink-0" />
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-2.5 w-12" />
            </div>
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
