"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Card, CardContent } from "@/src/components/ui/card";
import { Typography } from "@/src/components/ui/typography";
import { Network } from "lucide-react";
import { RoomType } from "../../types/room.type";
import { GroupAvatar } from "../GroupAvatar";
import { RoomDetailData } from "./types";

interface RoomProfileCardProps {
  room: RoomDetailData;
  currentUserId?: string;
}

export default function RoomProfileCard({
  room,
  currentUserId,
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

  let avatarNode = (
    <div className="size-18 rounded-full bg-gradient-to-br from-primary via-primary/90 to-secondary text-primary-foreground flex items-center justify-center shadow-md">
      <Network className="size-9 text-primary-foreground" />
    </div>
  );

  if (hasAvatar && isGroup) {
    avatarNode = (
      <div className="size-18 flex items-center justify-center">
        <GroupAvatar
          avatars={room.groupAvatars}
          singleAvatar={displayAvatar}
          title={displayName}
          size="md"
        />
      </div>
    );
  } else if (hasAvatar) {
    avatarNode = (
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
    );
  }

  return (
    <Card className="shadow-sm overflow-hidden m-0 p-1 sm:p-0">
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="shrink-0 py-2">{avatarNode}</div>

          <div className="flex-1 min-w-0 flex items-center justify-between gap-1">
            <Typography variant="h4" className="truncate">
              {displayName}
            </Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
