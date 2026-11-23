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
import { ToggleGroup, ToggleGroupItem } from "@/src/components/ui/toggle-group";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
} from "@/src/components/ui/empty";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { RoomDetailMember } from "./types";
import RoomMemberItem from "./RoomMemberItem";
import { MemberRole } from "../../types/room.type";

interface RoomMemberListProps {
  roomId: string;
  members: RoomDetailMember[];
  currentUserId?: string;
  onlineUsers: Record<string, boolean>;
}

type FilterRole = "ALL" | "ADMIN" | "MEMBER";

const INITIAL_LIMIT = 5;

export default function RoomMemberList({
  roomId,
  members,
  currentUserId,
  onlineUsers,
}: RoomMemberListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<FilterRole>("ALL");
  const [isExpanded, setIsExpanded] = useState(false);

  const myRole = useMemo(() => {
    if (!currentUserId) return undefined;
    const currentMember = members.find((m) => m.user?.id === currentUserId);
    return currentMember?.role as MemberRole | undefined;
  }, [members, currentUserId]);

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

  const handleFilterRoleChange = (nextValues: string[]) => {
    const nextRole = nextValues[0] as FilterRole | undefined;
    if (nextRole) {
      setFilterRole(nextRole);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleToggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

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
            {onlineCount} đang trực tuyến
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
                onChange={handleSearchChange}
                placeholder="Tìm theo tên thành viên..."
              />
            </InputGroup>
          </div>

          <ToggleGroup
            value={[filterRole]}
            onValueChange={handleFilterRoleChange}
            size="sm"
            spacing={1}
            aria-label="Lọc thành viên theo vai trò"
            className="p-1 bg-card border border-border rounded-xl shrink-0"
          >
            <ToggleGroupItem
              value="ALL"
              title="Tất cả"
              aria-label="Tất cả"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs cursor-pointer"
            >
              <Users data-icon="inline-start" />
              <span className="hidden sm:inline">Tất cả</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="ADMIN"
              title="Quản trị viên"
              aria-label="Quản trị viên"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs cursor-pointer"
            >
              <ShieldCheck data-icon="inline-start" />
              <span className="hidden sm:inline">Quản trị viên</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="MEMBER"
              title="Thành viên"
              aria-label="Thành viên"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs cursor-pointer"
            >
              <User data-icon="inline-start" />
              <span className="hidden sm:inline">Thành viên</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex flex-col gap-2 w-full min-w-0">
          {visibleMembers.length === 0 ? (
            <Empty className="p-8 border-0">
              <EmptyHeader>
                <EmptyDescription>
                  Không tìm thấy thành viên phù hợp
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
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
                  roomId={roomId}
                  myRole={myRole}
                />
              );
            })
          )}
        </div>

        {filteredMembers.length > 0 && (
          <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground font-medium">
            <p>
              Hiển thị {visibleMembers.length} / {filteredMembers.length} thành
              viên
            </p>

            {filteredMembers.length > INITIAL_LIMIT && (
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={handleToggleExpanded}
                className="h-auto p-0 text-xs font-semibold"
              >
                {isExpanded ? "Thu gọn danh sách" : "Xem danh sách đầy đủ"}
                {isExpanded ? (
                  <ChevronUp data-icon="inline-end" />
                ) : (
                  <ChevronDown data-icon="inline-end" />
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
