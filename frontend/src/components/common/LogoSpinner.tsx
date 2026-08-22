"use client";

import Image from "next/image";
import { cn } from "@/src/lib/utils";

interface LogoSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function LogoSpinner({ className, size = "md", showText = false }: LogoSpinnerProps) {
  const sizeClasses = {
    sm: { container: "h-8 w-8", image: "h-5 w-5", imgSize: "20px" },
    md: { container: "h-12 w-12", image: "h-7 w-7", imgSize: "28px" },
    lg: { container: "h-16 w-16", image: "h-9 w-9", imgSize: "36px" },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className={cn("relative flex items-center justify-center", currentSize.container)}>
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <div className={cn("relative", currentSize.image)}>
          <Image
            src="/logo.svg"
            alt="Logo"
            fill
            sizes={currentSize.imgSize}
            priority
            className="object-contain"
          />
        </div>
      </div>

      {showText && (
        <span className="text-xs font-medium text-muted-foreground tracking-wide animate-pulse">
          Đang tải dữ liệu...
        </span>
      )}
    </div>
  );
}
