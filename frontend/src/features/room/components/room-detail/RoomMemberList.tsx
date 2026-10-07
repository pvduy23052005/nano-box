"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/components/ui/input-group";
import { cn } from "@/src/lib/utils";
import { RoomDetailMember } from "./types";
import RoomMemberItem from "./RoomMemberItem";
import { MemberRole } from "../../types/room.type";
import { Button } from "@/src/components/ui/button";

interface RoomMemberListProps {
  members: RoomDetailMember[];
  currentUserId?: string;
  onlineUsers: Record<string, boolean>;
}

type FilterRole = "ALL" | "ADMIN" | "MEMBER";

const INITIAL_LIMIT = 5;

export default function RoomMemberList({
  members,
  currentUserId,
  onlineUsers,
}: RoomMemberListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<FilterRole>("ALL");
  const [isExpanded, setIsExpanded] = useState(false);

  const onlineCount = useMemo(() => {
    return members.filter((m) => m.user?.id && !!onlineUsers[m.user.id]).length;
  }, [members, onlineUsers]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      if (filterRole === "ADMIN") {
        if (
          member.role !== MemberRole.SUPER_ADMIN &&
          member.role !== MemberRole.ADMIN
        ) {
          return false;
        }
      } else if (filterRole === "MEMBER") {
        if (member.role !== MemberRole.MEMBER) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const name = member.user?.name?.toLowerCase() || "";
        return name.includes(query);
      }

      return true;
    });
  }, [members, filterRole, searchQuery]);

  const visibleMembers = isExpanded
    ? filteredMembers
    : filteredMembers.slice(0, INITIAL_LIMIT);

  return (
    <Card className="shadow-sm w-full min-w-0">
      <CardHeader className="p-2 sm:p-5 pb-0 sm:pb-0 flex-row items-center justify-between border-0 gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <CardTitle className="text-base sm:text-lg">Thành viên</CardTitle>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground shrink-0">
            <span
              className={cn(
                "size-2 rounded-full",
                onlineCount > 0 ? "bg-primary" : "bg-muted-foreground/30",
              )}
            />
            <span>{onlineCount} đang trực tuyến</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-2 sm:p-5 flex flex-col gap-3 sm:gap-4 w-full min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex-1 min-w-0">
            <InputGroup className="h-9 sm:h-10">
              <InputGroupAddon align="inline-start">
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên, email hoặc tài..."
              />
            </InputGroup>
          </div>

          <div className="inline-flex items-center p-1 bg-muted/40 border border-border rounded-xl shrink-0 gap-1">
            <Button
              type="button"
              variant={filterRole === "ALL" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterRole("ALL")}
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs whitespace-nowrap"
              title="Tất cả"
              aria-label="Tất cả"
            >
              <Users data-icon="inline-start" />
              <span className="hidden sm:inline">Tất cả</span>
            </Button>
            <Button
              type="button"
              variant={filterRole === "ADMIN" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterRole("ADMIN")}
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs whitespace-nowrap"
              title="Quản trị viên"
              aria-label="Quản trị viên"
            >
              <ShieldCheck data-icon="inline-start" />
              <span className="hidden sm:inline">Quản trị viên</span>
            </Button>
            <Button
              type="button"
              variant={filterRole === "MEMBER" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilterRole("MEMBER")}
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs whitespace-nowrap"
              title="Thành viên"
              aria-label="Thành viên"
            >
              <User data-icon="inline-start" />
              <span className="hidden sm:inline">Thành viên</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full min-w-0">
          {visibleMembers.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Không tìm thấy thành viên phù hợp
            </div>
          ) : (
            visibleMembers.map((member, index) => {
              const memberId = member.user?.id;
              const isMe = !!memberId && memberId === currentUserId;
              const isOnline = !!memberId && !!onlineUsers[memberId];

              return (
                <RoomMemberItem
                  key={memberId || `member-${index}`}
                  member={member}
                  isMe={isMe}
                  isOnline={isOnline}
                />
              );
            })
          )}
        </div>

        {filteredMembers.length > 0 && (
          <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground font-medium">
            <span>
              Hiển thị {visibleMembers.length} / {filteredMembers.length} thành
              viên
            </span>

            {filteredMembers.length > INITIAL_LIMIT && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1 text-primary font-semibold hover:underline cursor-pointer"
              >
                <span>
                  {isExpanded ? "Thu gọn danh sách" : "Xem danh sách đầy đủ"}
                </span>
                {isExpanded ? (
                  <ChevronUp className="size-3.5" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
