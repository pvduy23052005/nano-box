"use client";

import { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/src/components/ui/sheet";
import { Button } from "@/src/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/src/components/ui/input-group";
import { Spinner } from "@/src/components/ui/spinner";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useFriends } from "@/src/features/user/hooks/useGetFriends";
import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { useAddMember } from "../../hooks/useAddMember";
import { SelectedUser } from "../create-group/types";
import SelectedFriendBadges from "../create-group/SelectedFriendBadges";
import FriendSelectItem from "../create-group/FriendSelectItem";

interface AddMemberDrawerProps {
  onClose: () => void;
  roomId: string;
  existingMemberIds: string[];
}

export default function AddMemberDrawer({
  onClose,
  roomId,
  existingMemberIds,
}: AddMemberDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery.trim(), 300);
  const { friends, loading: loadingFriends } = useFriends(debouncedSearch);
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser?.id;
  const { addMember } = useAddMember();

  const availableFriends = useMemo(() => {
    const existingSet = new Set(existingMemberIds);
    if (currentUserId) {
      existingSet.add(currentUserId);
    }
    return (friends || []).filter((friend) => !existingSet.has(friend.id));
  }, [friends, existingMemberIds, currentUserId]);

  const handleClose = () => {
    if (isSubmitting) return;
    setSearchQuery("");
    setSelectedUsers([]);
    onClose();
  };

  const handleToggleUser = (user: SelectedUser) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((selectedUser) => selectedUser.id === user.id);
      if (exists) {
        return prev.filter((selectedUser) => selectedUser.id !== user.id);
      }
      return [...prev, user];
    });
  };

  const handleRemoveSelectedUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.filter((selectedUser) => selectedUser.id !== userId),
    );
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    const usersToAdd = [...selectedUsers];
    handleClose();

    try {
      await Promise.allSettled(
        usersToAdd.map((user) =>
          addMember(roomId, user.id, user.name, user.avatar),
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open onOpenChange={(open) => !open && handleClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 gap-0 overflow-hidden shadow-2xl"
      >
        <SheetHeader className="p-4 sm:p-5 border-b border-border/60 gap-1.5 pr-12">
          <SheetTitle className="text-base sm:text-lg font-semibold">
            Thêm thành viên
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
          <SelectedFriendBadges
            selectedUsers={selectedUsers}
            onRemove={handleRemoveSelectedUser}
          />

          <InputGroup className="h-9 shrink-0">
            <InputGroupAddon align="inline-start">
              <Search className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              id="drawer-friend-search"
              className="text-xs sm:text-sm"
              placeholder="Tìm kiếm bạn bè theo tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSubmitting}
            />
            {searchQuery && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => setSearchQuery("")}
                  title="Xóa tìm kiếm"
                  aria-label="Xóa tìm kiếm"
                  className="cursor-pointer"
                >
                  <X className="size-3.5" />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>

          <div className="border border-border/60 rounded-xl overflow-hidden flex flex-col flex-1 min-h-[240px] bg-muted/10">
            <div className="flex-1 overflow-y-auto divide-y divide-border/40">
              {loadingFriends ? (
                <div className="flex h-full items-center justify-center p-4 text-xs text-muted-foreground gap-2">
                  <Spinner className="size-4" />
                  Đang tìm kiếm bạn bè...
                </div>
              ) : availableFriends.length === 0 ? (
                <div className="flex flex-col h-full items-center justify-center p-4 text-xs text-muted-foreground text-center gap-1">
                  {searchQuery ? (
                    <p>
                      Không tìm thấy bạn bè nào khớp với &quot;{searchQuery}
                      &quot;
                    </p>
                  ) : (friends || []).length > 0 ? (
                    <>
                      <p className="font-medium text-foreground">
                        Tất cả bạn bè đã tham gia nhóm
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Không có bạn bè nào khác để thêm vào nhóm này.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-foreground">
                        Bạn chưa có bạn bè nào
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Kết bạn trước để có thể thêm thành viên vào nhóm.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                availableFriends.map((friend) => (
                  <FriendSelectItem
                    key={friend.id}
                    friend={friend}
                    isSelected={selectedUsers.some(
                      (user) => user.id === friend.id,
                    )}
                    onToggle={handleToggleUser}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <SheetFooter className="p-3 sm:p-4 border-t border-border/60 bg-muted/20 gap-2 flex-row justify-end mt-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || selectedUsers.length === 0}
            className="cursor-pointer"
          >
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {selectedUsers.length > 0
              ? `Thêm (${selectedUsers.length})`
              : "Thêm thành viên"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
