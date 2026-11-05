"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Network, Pencil } from "lucide-react";
import { RoomType } from "../../types/room.type";
import { GroupAvatar } from "../GroupAvatar";
import { Card, CardContent } from "@/src/components/ui/card";
import { RoomDetailData } from "./types";
import { Typography } from "@/src/components/ui/typography";

interface RoomProfileCardProps {
  room: RoomDetailData;
  currentUserId?: string;
  onClickAddMember?: () => void;
  canEdit?: boolean;
  onEdit?: () => void;
}

export default function RoomProfileCard({
  room,
  currentUserId,
  canEdit = false,
  onEdit,
}: RoomProfileCardProps) {
  const isGroup = room.typeRoom === RoomType.GROUP;
  const otherMember = !isGroup
    ? room.members?.find((m) => m.user?.id !== currentUserId)
    : null;

  const displayName =
    room.title ||
    (otherMember?.user?.name ? otherMember.user.name : "Cuộc trò chuyện");
  const displayAvatar = room.avatar || otherMember?.user?.avatar || "";
  const initials = displayName.slice(0, 2).toUpperCase();

  const hasAvatar =
    !!displayAvatar || (room.groupAvatars && room.groupAvatars.length > 0);

  const isEditable = canEdit && isGroup && Boolean(onEdit);

  return (
    <Card className="shadow-sm overflow-hidden m-0 p-1 sm:p-0">
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="shrink-0 py-2">
            {hasAvatar ? (
              isGroup ? (
                <div className="size-18 flex items-center justify-center">
                  <GroupAvatar
                    avatars={room.groupAvatars}
                    singleAvatar={displayAvatar}
                    title={displayName}
                    size="md"
                  />
                </div>
              ) : (
                <Avatar className="size-12 rounded-full overflow-hidden">
                  <AvatarImage
                    src={displayAvatar}
                    alt={displayName}
                    className="rounded-full"
                  />
                  <AvatarFallback className="rounded-full text-xl font-bold bg-primary/15 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              )
            ) : (
              <div className="size-18 rounded-full bg-gradient-to-br from-primary via-primary/90 to-secondary text-primary-foreground flex items-center justify-center shadow-md">
                <Network className="size-9 text-primary-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex items-center justify-between gap-1">
            <Typography variant="h4" className="truncate">
              {displayName}
            </Typography>
            {isEditable && (
              <button
                type="button"
                onClick={onEdit}
                className="size-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer shrink-0"
                title="Chỉnh sửa thông tin phòng"
                aria-label="Chỉnh sửa thông tin phòng"
              >
                <Pencil className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
