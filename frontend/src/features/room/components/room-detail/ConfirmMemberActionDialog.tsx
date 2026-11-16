"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Spinner } from "@/src/components/ui/spinner";
import { AlertTriangle } from "lucide-react";

interface ConfirmMemberActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: "default" | "destructive";
  memberName: string;
  memberAvatar?: string;
  loading?: boolean;
  onConfirm: () => void;
}

export default function ConfirmMemberActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmVariant = "destructive",
  memberName,
  memberAvatar,
  loading = false,
  onConfirm,
}: ConfirmMemberActionDialogProps) {
  const initials = memberName.slice(0, 2).toUpperCase();

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-2 text-destructive">
            <div className="p-2 rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <DialogTitle className="text-base sm:text-lg">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50 my-1">
          <Avatar className="size-10 shrink-0">
            <AvatarImage src={memberAvatar || ""} alt={memberName} />
            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-semibold text-sm text-foreground truncate">
              {memberName}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="h-9 px-4 text-xs sm:text-sm"
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={loading}
            className="h-9 px-4 text-xs sm:text-sm"
          >
            {loading && <Spinner data-icon="inline-start" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
