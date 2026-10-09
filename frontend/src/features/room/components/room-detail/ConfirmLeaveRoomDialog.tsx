"use client";

import { AlertTriangle, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Spinner } from "@/src/components/ui/spinner";
import { useLeaveRoom } from "../../hooks/useLeaveRoom";

interface ConfirmLeaveRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  roomTitle?: string;
  isSuperAdmin?: boolean;
  memberCount?: number;
}

export default function ConfirmLeaveRoomDialog({
  open,
  onOpenChange,
  roomId,
  roomTitle,
  isSuperAdmin = false,
  memberCount = 0,
}: ConfirmLeaveRoomDialogProps) {
  const { leaveRoom, isLeaving } = useLeaveRoom();

  const handleConfirmLeave = async () => {
    const success = await leaveRoom(roomId);
    if (success) {
      onOpenChange(false);
    }
  };

  const isSoleMember = memberCount <= 1;

  return (
    <Dialog open={open} onOpenChange={isLeaving ? () => {} : onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center sm:items-start gap-2">
          <div className="size-11 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <LogOut className="size-5" />
          </div>
          <DialogTitle className="text-lg font-bold">Rời khỏi phòng</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground text-center sm:text-left">
            Bạn có chắc chắn muốn rời khỏi{" "}
            {roomTitle ? (
              <span className="font-semibold text-foreground">
                &ldquo;{roomTitle}&rdquo;
              </span>
            ) : (
              "phòng này"
            )}?
          </DialogDescription>
        </DialogHeader>

        {isSuperAdmin && !isSoleMember && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200 flex gap-2 items-center">
            <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Quyền Trưởng nhóm sẽ tự động chuyển cho thành viên khác.</span>
          </div>
        )}

        {isSoleMember && (
          <div className="rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-xs text-destructive flex gap-2 items-center">
            <AlertTriangle className="size-4 shrink-0" />
            <span>Phòng trò chuyện sẽ bị giải tán và xóa vĩnh viễn.</span>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLeaving}
            className="cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmLeave}
            disabled={isLeaving}
            className="cursor-pointer gap-2"
          >
            {isLeaving && <Spinner className="size-4" />}
            Rời phòng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
