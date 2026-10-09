"use client";

import { Card } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export default function RoomDetailSkeleton() {
  return (
    <div className="h-full w-full bg-background text-foreground overflow-y-auto">
      <div className="max-w-5xl w-full mx-auto p-2.5 sm:p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-9 w-48 rounded-lg" />
          <Skeleton className="size-9 rounded-lg shrink-0" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start w-full min-w-0">
          <div className="lg:col-span-4 flex flex-col gap-2 w-full min-w-0">
            <Card className="p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Skeleton className="size-16 rounded-2xl shrink-0" />
                <Skeleton className="h-6 flex-1 rounded-lg" />
              </div>
            </Card>

            <Card className="p-4 shadow-sm flex flex-col gap-3">
              <Skeleton className="h-5 w-32 rounded-lg" />
              <div className="flex flex-col gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-xl" />
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-8 w-full min-w-0">
            <Card className="p-4 sm:p-5 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-28 rounded-lg" />
                <Skeleton className="h-4 w-32 rounded-lg" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1 rounded-lg" />
                <Skeleton className="h-9 w-36 rounded-lg" />
              </div>
              <div className="flex flex-col gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
