"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, RotateCcw, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/src/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/src/components/ui/input-group";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { GroupAvatar } from "../GroupAvatar";
import { Spinner } from "@/src/components/ui/spinner";
import { useUpdateRoomProfile } from "../../hooks/useUpdateRoomProfile";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

interface EditRoomProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  initialTitle: string;
  initialAvatar?: string | null;
  groupAvatars?: (string | null)[] | null;
}

export default function EditRoomProfileDialog(
  props: EditRoomProfileDialogProps,
) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {props.open && <EditRoomProfileDialogContent {...props} />}
    </Dialog>
  );
}

function EditRoomProfileDialogContent({
  onOpenChange,
  roomId,
  initialTitle,
  initialAvatar,
  groupAvatars,
}: EditRoomProfileDialogProps) {
  const [title, setTitle] = useState(initialTitle || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { updateRoomProfile, isSubmitting, isUploading } =
    useUpdateRoomProfile();

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Vui lòng chọn định dạng ảnh hợp lệ (JPEG, PNG, WEBP, GIF)");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("Dung lượng ảnh tối đa là 5MB");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setRemoveAvatar(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoveAvatar(true);
  };

  const handleResetAvatar = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoveAvatar(false);
  };

  const cleanTitle = title.trim();
  const isTitleValid = cleanTitle.length > 0 && cleanTitle.length <= 100;

  const hasAvatarChanges =
    selectedFile !== null || (removeAvatar && Boolean(initialAvatar));
  const hasTitleChanges = cleanTitle !== (initialTitle || "").trim();
  const hasChanges = hasTitleChanges || hasAvatarChanges;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTitleValid || !hasChanges || isSubmitting) return;

    const success = await updateRoomProfile({
      roomId,
      title: cleanTitle,
      avatarFile: selectedFile,
      removeAvatar,
    });

    if (success) {
      onOpenChange(false);
    }
  };

  const displayName = cleanTitle || initialTitle || "Nhóm";
  const initials = displayName.slice(0, 2).toUpperCase();

  const currentDisplayAvatar = removeAvatar
    ? null
    : previewUrl || initialAvatar || null;

  return (
    <DialogContent className="max-w-md w-full p-4 sm:p-6 overflow-hidden">
      <DialogHeader>
        <DialogTitle className="text-base sm:text-lg font-bold">
          Chỉnh sửa thông tin phòng
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative group/avatar">
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              onChange={handleFileSelect}
              className="hidden"
              disabled={isSubmitting}
              aria-label="Tải ảnh đại diện phòng"
            />

            <div
              onClick={() => !isSubmitting && fileInputRef.current?.click()}
              className={cn(
                "relative size-24 rounded-full overflow-hidden transition-all duration-200 cursor-pointer flex items-center justify-center ",
                !isSubmitting &&
                  "hover:border-primary/80 hover:shadow-lg group-hover/avatar:ring-2 group-hover/avatar:ring-primary/20",
              )}
              title="Nhấn để chọn ảnh mới"
            >
              {currentDisplayAvatar ? (
                <Avatar className="size-full rounded-full">
                  <AvatarImage
                    src={currentDisplayAvatar}
                    alt={displayName}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-xl font-bold bg-primary/15 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="size-full flex items-center justify-center">
                  <GroupAvatar
                    avatars={groupAvatars}
                    singleAvatar=""
                    title={displayName}
                    size="md"
                  />
                </div>
              )}

              <div
                className={cn(
                  "absolute inset-0 bg-black/45 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1 text-white opacity-0 transition-opacity duration-200",
                  !isSubmitting && "group-hover/avatar:opacity-100",
                )}
              >
                <Camera className="size-5" />
                <span className="text-[11px] font-medium">Thay đổi</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="cursor-pointer text-xs h-7 px-2.5 gap-1.5"
            >
              <ImagePlus className="size-3.5" />
              <span>{currentDisplayAvatar ? "Đổi ảnh" : "Tải ảnh lên"}</span>
            </Button>

            {removeAvatar ? (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleResetAvatar}
                disabled={isSubmitting}
                className="cursor-pointer text-xs h-7 px-2.5 gap-1 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3" />
                <span>Hoàn tác gỡ</span>
              </Button>
            ) : currentDisplayAvatar ? (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleRemoveAvatar}
                disabled={isSubmitting}
                className="cursor-pointer text-xs h-7 px-2.5 gap-1 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3" />
                <span>Gỡ ảnh</span>
              </Button>
            ) : null}
          </div>
        </div>

        <Field className="gap-1.5">
          <div className="flex items-center justify-between">
            <FieldLabel
              htmlFor="room-title-input"
              className="text-xs sm:text-sm font-medium"
            >
              Tên phòng nhóm <span className="text-destructive">*</span>
            </FieldLabel>
            <span
              className={cn(
                "text-[11px] font-mono",
                cleanTitle.length > 100
                  ? "text-destructive font-bold"
                  : "text-muted-foreground",
              )}
            >
              {cleanTitle.length} / 100
            </span>
          </div>

          <InputGroup className="h-9 sm:h-10">
            <InputGroupInput
              id="room-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên phòng nhóm..."
              disabled={isSubmitting}
              maxLength={100}
              className="text-xs sm:text-sm"
            />
            {title && !isSubmitting && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => setTitle("")}
                  title="Xóa tiêu đề"
                  aria-label="Xóa tiêu đề"
                  className="cursor-pointer"
                >
                  <X className="size-3.5" />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>

          {cleanTitle.length === 0 && (
            <FieldError className="text-[11px] text-destructive">
              Tên phòng không được để trống
            </FieldError>
          )}
        </Field>

        <DialogFooter className="gap-2 sm:gap-2 pt-2 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="h-9 px-4 text-xs sm:text-sm cursor-pointer"
          >
            Hủy
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={!hasChanges || !isTitleValid || isSubmitting}
            className="h-9 px-4 text-xs sm:text-sm cursor-pointer"
          >
            {isSubmitting && <Spinner className="size-3.5 mr-1.5" />}
            <span>
              {isUploading
                ? "Đang tải ảnh..."
                : isSubmitting
                  ? "Đang lưu..."
                  : "Lưu thay đổi"}
            </span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
