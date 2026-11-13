"use client";

import { useState } from "react";
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
import { useAddMember } from "../../hooks/useAddMember";
import { useSelectableFriends } from "../../hooks/useSelectableFriends";
import SelectedFriendBadges from "../create-group/SelectedFriendBadges";
import FriendSelectList from "../create-group/FriendSelectList";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    selectedUsers,
    availableFriends,
    totalFriendsCount,
    loadingFriends,
    handleToggleUser,
    handleRemoveSelectedUser,
    resetSelection,
  } = useSelectableFriends({ excludeIds: existingMemberIds });

  const { addMember } = useAddMember();

  const handleClose = () => {
    if (isSubmitting) return;
    resetSelection();
    onClose();
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

  const hasFriends = totalFriendsCount > 0;
  const emptyTitle = hasFriends
    ? "Tất cả bạn bè đã tham gia nhóm"
    : "Bạn chưa có bạn bè nào";
  const emptyDescription = hasFriends
    ? "Không có bạn bè nào khác để thêm vào nhóm này."
    : "Kết bạn trước để có thể thêm thành viên vào nhóm.";

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
              <Search />
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
                >
                  <X />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>

          <FriendSelectList
            friends={availableFriends}
            selectedUsers={selectedUsers}
            onToggleUser={handleToggleUser}
            loading={loadingFriends}
            searchQuery={searchQuery}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            className="flex-1 min-h-[240px] rounded-xl h-auto"
          />
        </div>

        <SheetFooter className="p-3 sm:p-4 border-t border-border/60 bg-muted/20 gap-2 flex-row justify-end mt-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || selectedUsers.length === 0}
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
