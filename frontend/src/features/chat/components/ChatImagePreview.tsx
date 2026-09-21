import Image from "next/image";
import {
  Loader2,
  X,
  FileText,
  FileArchive,
  FileSpreadsheet,
  FileCode,
} from "lucide-react";

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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return <FileArchive className="size-5 text-amber-500" />;
  }
  if (["xls", "xlsx", "csv"].includes(ext)) {
    return <FileSpreadsheet className="size-5 text-emerald-500" />;
  }
  if (["js", "ts", "json", "html", "css", "py", "go"].includes(ext)) {
    return <FileCode className="size-5 text-indigo-500" />;
  }
  return <FileText className="size-5 text-primary" />;
}

export default function ChatImagePreview({
  images,
  onRemove,
}: ChatImagePreviewProps) {
  if (!images.length) return null;

  return (
    <div className="flex items-center gap-2 p-2 border-b overflow-x-auto">
      {images.map((img) => {
        const isImage = img.file.type.startsWith("image/");

        if (isImage) {
          return (
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
          );
        }

        return (
          <div
            key={img.id}
            className="relative flex items-center gap-2.5 px-3 py-2 rounded-lg border bg-muted/70 max-w-[220px] shrink-0 group"
          >
            <div className="size-9 rounded-md bg-background border flex items-center justify-center shrink-0">
              {getFileIcon(img.file.name)}
            </div>

            <div className="flex-1 min-w-0 pr-4">
              <p className="text-xs font-medium truncate" title={img.file.name}>
                {img.file.name}
              </p>
              <span className="text-[10px] text-muted-foreground">
                {formatFileSize(img.file.size)}
              </span>
            </div>

            {img.status === UploadStatus.UPLOADING && (
              <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center gap-1.5">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Đang tải...</span>
              </div>
            )}

            {img.status === UploadStatus.ERROR && (
              <div className="absolute inset-0 bg-destructive/90 rounded-lg flex items-center justify-center p-1 text-center">
                <span className="text-xs text-white font-medium">
                  Lỗi tải file
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => onRemove(img.id)}
              className="absolute top-1.5 right-1.5 size-4 bg-muted-foreground/30 hover:bg-muted-foreground/60 text-foreground rounded-full flex items-center justify-center transition-colors"
              title="Xóa file"
            >
              <X className="size-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
