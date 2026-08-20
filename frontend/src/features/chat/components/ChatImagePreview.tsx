import Image from "next/image";
import { Loader2, X } from "lucide-react";

export enum UploadStatus {
  UPLOADING = "uploading",
  SUCCESS = "success",
  ERROR = "error",
}

export interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
  status: UploadStatus;
  uploadedUrl?: string;
  tempKey?: string;
  errorMessage?: string;
}

interface ChatImagePreviewProps {
  images: PendingImage[];
  onRemove: (id: string) => void;
}

export default function ChatImagePreview({
  images,
  onRemove,
}: ChatImagePreviewProps) {
  if (!images.length) return null;

  return (
    <div className="flex items-center gap-2 p-2 border-b overflow-x-auto">
      {images.map((img) => (
        <div
          key={img.id}
          className="relative size-16 rounded-lg overflow-hidden border bg-muted shrink-0"
        >
          <Image
            src={img.previewUrl}
            alt={img.file.name}
            fill
            unoptimized
            className="object-cover"
          />

          {img.status === UploadStatus.UPLOADING && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="size-5 text-white animate-spin" />
            </div>
          )}

          {img.status === UploadStatus.ERROR && (
            <div className="absolute inset-0 bg-destructive/80 flex items-center justify-center p-1 text-center">
              <span className="text-[10px] text-white font-medium">
                Lỗi tải
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => onRemove(img.id)}
            className="absolute top-1 right-1 size-4 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center"
            title="Xóa ảnh"
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
