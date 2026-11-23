"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, Mail, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/src/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/components/ui/input-group";
import { Spinner } from "@/src/components/ui/spinner";

interface EditProfileDialogProps {
  onClose: () => void;
}

export default function EditProfileDialog({ onClose }: EditProfileDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { updateProfile, loading, isUploading } = useUpdateProfile();

  const [name, setName] = useState(user?.name || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [nameError, setNameError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!val.trim()) {
      setNameError("Họ và tên không được để trống");
    } else {
      setNameError("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn định dạng file hình ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Họ và tên không được để trống");
      return;
    }

    try {
      await updateProfile({
        name: trimmedName,
        avatarFile: selectedFile,
      });
      onClose();
    } catch {}
  };

  const hasChanges =
    name.trim() !== (user?.name || "") || selectedFile !== null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin cá nhân</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-2">
          <div className="flex flex-col items-center justify-center gap-3">
            <div
              onClick={handleTriggerFileInput}
              className="group relative cursor-pointer rounded-full p-1 ring-2 ring-primary/20 hover:ring-primary transition-all duration-300"
              title="Nhấn để thay đổi ảnh đại diện"
            >
              <Avatar className="size-24 border-2 border-background shadow-md">
                <AvatarImage
                  src={previewUrl || user?.avatar || "/logo.png"}
                  alt={user?.name || "avatar"}
                  className="object-cover"
                />
                <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                  {user?.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="size-6 mb-1" />
                <span className="text-[11px] font-medium">Đổi ảnh</span>
              </div>

              <div className="absolute bottom-1 right-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                <Camera className="size-3.5" />
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <FieldGroup>
            <Field data-invalid={!!nameError}>
              <FieldLabel htmlFor="name">Họ và tên</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Nhập họ và tên..."
                  disabled={loading}
                  aria-invalid={!!nameError}
                />
                <InputGroupAddon align="inline-end">
                  <UserIcon />
                </InputGroupAddon>
              </InputGroup>
              {nameError && <FieldError>{nameError}</FieldError>}
            </Field>

            <Field data-disabled>
              <FieldLabel htmlFor="email">Địa chỉ email</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="email"
                  value={user?.email || ""}
                  disabled
                />
                <InputGroupAddon align="inline-end">
                  <Mail />
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </FieldGroup>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading || !hasChanges || !name.trim() || !!nameError}
              className="cursor-pointer"
            >
              {loading && <Spinner data-icon="inline-start" />}
              {isUploading
                ? "Đang tải ảnh..."
                : loading
                  ? "Đang lưu..."
                  : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
