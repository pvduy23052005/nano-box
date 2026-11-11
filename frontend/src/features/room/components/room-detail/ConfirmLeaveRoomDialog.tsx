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
import { Alert, AlertDescription } from "@/src/components/ui/alert";
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
          <Alert className="text-xs">
            <AlertTriangle />
            <AlertDescription className="text-xs">
              Quyền Trưởng nhóm sẽ tự động chuyển cho thành viên khác.
            </AlertDescription>
          </Alert>
        )}

        {isSoleMember && (
          <Alert variant="destructive" className="text-xs">
            <AlertTriangle />
            <AlertDescription className="text-xs">
              Phòng trò chuyện sẽ bị giải tán và xóa vĩnh viễn.
            </AlertDescription>
          </Alert>
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
            className="cursor-pointer"
          >
            {isLeaving && <Spinner data-icon="inline-start" />}
            Rời phòng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
