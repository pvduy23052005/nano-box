"use client";

import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Typography } from "@/src/components/ui/typography";

interface RoomDetailErrorProps {
  onRetry?: () => void;
  onBack?: () => void;
}

export default function RoomDetailError({
  onRetry,
  onBack,
}: RoomDetailErrorProps) {
  return (
    <div className="flex h-full flex-col w-full bg-background text-foreground items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center flex flex-col gap-4">
        <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="size-6" />
        </div>
        <div>
          <Typography variant="h4" className="font-semibold text-lg">
            Không tìm thấy phòng trò chuyện
          </Typography>
          <Typography variant="muted" className="text-sm mt-1">
            Phòng này có thể không tồn tại hoặc bạn không có quyền truy cập.
          </Typography>
        </div>
        <div className="flex items-center justify-center gap-2 pt-2">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="cursor-pointer"
            >
              <RefreshCw data-icon="inline-start" />
              Thử lại
            </Button>
          )}
          {onBack && (
            <Button
              size="sm"
              onClick={onBack}
              className="cursor-pointer"
            >
              <ArrowLeft data-icon="inline-start" />
              Quay lại tin nhắn
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
