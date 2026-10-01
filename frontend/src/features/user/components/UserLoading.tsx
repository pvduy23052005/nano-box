import { Skeleton } from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";

export interface UserLoadingProps {
  count?: number;
  className?: string;
}

export function UserCardSkeleton() {
  return (
    <div className="p-3 bg-card border rounded-xl flex flex-row items-center justify-between gap-2 shadow-xs">
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <Skeleton className="size-10 rounded-full shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <Skeleton className="h-4 w-28 sm:w-32 rounded" />
          <Skeleton className="h-3 w-16 sm:w-20 rounded" />
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}

export default function UserLoading({
  count = 6,
  className,
}: UserLoadingProps) {
  return (
    <div
      className={cn(
        "grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <UserCardSkeleton key={index} />
      ))}
    </div>
  );
}
