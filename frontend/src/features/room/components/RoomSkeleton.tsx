import { Skeleton } from "@/src/components/ui/skeleton";

interface RoomSkeletonProps {
  count?: number;
}

export default function RoomSkeleton({ count = 4 }: RoomSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-3 p-2">
          <Skeleton className="size-10 rounded-full shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
}

export { RoomSkeleton };
