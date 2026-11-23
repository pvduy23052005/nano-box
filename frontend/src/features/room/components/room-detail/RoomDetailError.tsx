"use client";

import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/components/ui/empty";

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
      <Card className="max-w-md w-full">
        <CardContent className="p-0">
          <Empty className="p-6 border-0">
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                className="size-12 rounded-full bg-destructive/10 text-destructive [&_svg:not([class*='size-'])]:size-6"
              >
                <AlertCircle />
              </EmptyMedia>
              <EmptyTitle className="font-semibold text-lg">
                Không tìm thấy phòng trò chuyện
              </EmptyTitle>
              <EmptyDescription>
                Phòng này có thể không tồn tại hoặc bạn không có quyền truy
                cập.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2 pt-2">
              {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  <RefreshCw data-icon="inline-start" />
                  Thử lại
                </Button>
              )}
              {onBack && (
                <Button size="sm" onClick={onBack}>
                  <ArrowLeft data-icon="inline-start" />
                  Quay lại tin nhắn
                </Button>
              )}
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    </div>
  );
}
