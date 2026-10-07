"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Network } from "lucide-react";
import { RoomType } from "../../types/room.type";
import { GroupAvatar } from "../GroupAvatar";
import { Card, CardContent } from "@/src/components/ui/card";
import { RoomDetailData } from "./types";
import { Typography } from "@/src/components/ui/typography";

interface RoomProfileCardProps {
  room: RoomDetailData;
  currentUserId?: string;
  onClickAddMember: () => void;
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

  return (
    <Card className="shadow-sm overflow-hidden m-0 p-1 sm:p-0">
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="shrink-0">
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
                <Avatar className="size-20 rounded-2xl border-2 border-border/60 shadow-xs">
                  <AvatarImage
                    src={displayAvatar}
                    alt={displayName}
                    className="rounded-2xl"
                  />
                  <AvatarFallback className="rounded-2xl text-xl font-bold bg-primary/15 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              )
            ) : (
              <div className="size-20 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary text-primary-foreground flex items-center justify-center shadow-md">
                <Network className="size-10 text-primary-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <Typography variant="h4">{displayName}</Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
