"use client";

import {
  FileText,
  FileArchive,
  FileSpreadsheet,
  FileCode,
  Download as DownloadIcon,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface ChatMessageFileProps {
  url: string;
  isMe?: boolean;
  className?: string;
}

export function getAttachmentFileName(url: string): string {
  try {
    if (url.includes("#name=")) {
      return decodeURIComponent(url.split("#name=")[1].split("&")[0]);
    }
    const cleanUrl = url.split("?")[0];
    const rawName = cleanUrl.split("/").pop() || "Tập tin";
    const decoded = decodeURIComponent(rawName);
    const match = decoded.match(/^[a-z0-9]+-[a-z0-9]+-(.+)$/i);
    return match ? match[1] : decoded;
  } catch {
    return "Tập tin";
  }
}

export function getAttachmentFileExt(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toUpperCase() : "FILE";
}

export function getAttachmentFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return <FileArchive className="size-5 text-amber-500 shrink-0" />;
  }
  if (["xls", "xlsx", "csv"].includes(ext)) {
    return <FileSpreadsheet className="size-5 text-emerald-500 shrink-0" />;
  }
  if (["js", "ts", "json", "html", "css", "py", "go"].includes(ext)) {
    return <FileCode className="size-5 text-indigo-500 shrink-0" />;
  }
  return <FileText className="size-5 text-primary shrink-0" />;
}

export default function ChatMessageFile({
  url,
  isMe = false,
  className,
}: ChatMessageFileProps) {
  const fileName = getAttachmentFileName(url);
  const fileExt = getAttachmentFileExt(fileName);
  const downloadUrl = url.split("#")[0];

  return (
    <a
      href={downloadUrl}
      target="_blank"
      rel="noopener noreferrer"
      download={fileName}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all max-w-sm w-full group/file shadow-lg bg-muted",
        isMe
          ? "bg-primary-foreground/15 border-primary/20 hover:opacity-95"
          : "bg-muted hover:bg-accent border-border text-foreground",
        className,
      )}
      title={`Tải xuống ${fileName}`}
    >
      <div
        className={cn(
          "size-10 rounded-lg flex items-center justify-center shrink-0 bg-primary-foreground",
          isMe ? "text-primary" : "text-secondary",
        )}
      >
        {getAttachmentFileIcon(fileName)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate group-hover/file:underline">
          {fileName}
        </p>
        <span className="text-[10px] font-mono uppercase font-semibold text-muted-foreground">
          {fileExt}
        </span>
      </div>

      <div
        className={cn(
          "size-8 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover/file:scale-110 text-muted-foreground",
          isMe
            ? "hover:bg-primary-foreground/20"
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
        )}
      >
        <DownloadIcon className="size-4" />
      </div>
    </a>
  );
}
