"use client";

import { Dialog } from "@/src/components/ui/dialog";
import EditRoomProfileDialogContent, {
  EditRoomProfileDialogContentProps,
} from "./EditRoomProfileDialogContent";

interface EditRoomProfileDialogProps extends EditRoomProfileDialogContentProps {
  open: boolean;
}

export default function EditRoomProfileDialog({
  open,
  onOpenChange,
  roomId,
  initialTitle,
  initialAvatar,
  groupAvatars,
}: EditRoomProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <EditRoomProfileDialogContent
          onOpenChange={onOpenChange}
          roomId={roomId}
          initialTitle={initialTitle}
          initialAvatar={initialAvatar}
          groupAvatars={groupAvatars}
        />
      )}
    </Dialog>
  );
}
