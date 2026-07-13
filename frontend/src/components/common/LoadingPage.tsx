"use client";

import Image from "next/image";

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-16 w-16 flex items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-muted border-t-primary" />

          <div className="relative h-9 w-9">
            <Image
              src="/logo.svg"
              alt="Logo"
              fill
              sizes="36px"
              priority
              className="object-contain"
            />
          </div>
        </div>

        <span className="text-xs font-medium text-muted-foreground tracking-wide animate-pulse">
          Đang tải dữ liệu...
        </span>
      </div>
    </div>
  );
}
