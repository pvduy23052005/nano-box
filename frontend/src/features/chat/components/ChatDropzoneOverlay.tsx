import { UploadCloud, ImagePlus, FileText } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ChatDropzoneOverlayProps {
  isVisible: boolean;
}

export default function ChatDropzoneOverlay({
  isVisible,
}: ChatDropzoneOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-40 p-4 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-200 pointer-events-none",
        isVisible
          ? "opacity-100 scale-100"
          : "opacity-0 scale-98 pointer-events-none",
      )}
      aria-hidden={!isVisible}
    >
      <div className="w-full h-full border-2 border-dashed border-primary/70 bg-primary/5 rounded-xl flex flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm">
          <UploadCloud className="size-8" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">
            Thả ảnh hoặc tệp vào đây
          </p>
          <p className="text-xs text-muted-foreground">
            Tệp sẽ được tải lên và sẵn sàng gửi trong tin nhắn
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80 mt-1">
          <span className="flex items-center gap-1">
            <ImagePlus className="size-3.5" /> Hình ảnh
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <FileText className="size-3.5" /> Tài liệu & tệp nén
          </span>
        </div>
      </div>
    </div>
  );
}
