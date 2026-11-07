"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/src/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/src/components/ui/input-group";
import { Spinner } from "@/src/components/ui/spinner";
import { Search, Users, X } from "lucide-react";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useFriends } from "@/src/features/user/hooks/useGetFriends";
import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import { useCreateGroupRoom } from "../hooks/useCreateGroupRoom";
import { SelectedUser } from "./create-group/types";
import SelectedFriendBadges from "./create-group/SelectedFriendBadges";
import FriendSelectList from "./create-group/FriendSelectList";

interface CreateGroupRoomDialogProps {
  onClose: () => void;
}

export default function CreateGroupRoomDialog({
  onClose,
}: CreateGroupRoomDialogProps) {
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);

  const debouncedSearch = useDebounce(searchQuery.trim(), 300);
  const { friends, loading: loadingFriends } = useFriends(debouncedSearch);
  const currentUser = useAuthStore((state) => state.user);
  const { createGroupRoom, loading: isCreating } = useCreateGroupRoom();

  const availableFriends = (friends || []).filter(
    (friend) => friend.id !== currentUser?.id,
  );

  const handleClose = () => {
    setTitle("");
    setTitleError("");
    setSearchQuery("");
    setSelectedUsers([]);
    onClose();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!val.trim()) {
      setTitleError("Tên nhóm không được để trống");
    } else {
      setTitleError("");
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setTitleError("Tên nhóm không được để trống");
      return;
    }

    if (selectedUsers.length < 2) {
      return;
    }

    try {
      await createGroupRoom({
        title: cleanTitle,
        memberIds: selectedUsers.map((selectedUser) => selectedUser.id),
      });
      handleClose();
    } catch {}
  };

  const isSubmitDisabled =
    isCreating || !title.trim() || selectedUsers.length < 2;

  return (
    <Dialog open onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-5 border-b border-border/60">
          <DialogTitle className="text-base sm:text-lg font-semibold">
            Tạo nhóm trò chuyện mới
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
            <FieldGroup>
              <Field data-invalid={!!titleError}>
                <FieldLabel htmlFor="group-title">
                  Tên nhóm <span className="text-destructive">*</span>
                </FieldLabel>
                <InputGroup className="h-9">
                  <InputGroupAddon align="inline-start">
                    <Users className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="group-title"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Nhập tên nhóm trò chuyện..."
                    disabled={isCreating}
                    aria-invalid={!!titleError}
                    maxLength={100}
                  />
                </InputGroup>
                {titleError && <FieldError>{titleError}</FieldError>}
              </Field>

              <Field>
                <SelectedFriendBadges
                  selectedUsers={selectedUsers}
                  onRemove={handleRemoveSelectedUser}
                />

                <InputGroup className="h-8">
                  <InputGroupAddon align="inline-start">
                    <Search className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="friend-search"
                    className="text-xs"
                    placeholder="Tìm kiếm bạn bè theo tên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isCreating}
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
                />
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter className="p-3 sm:p-4 border-t border-border/60 bg-muted/20 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isCreating}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitDisabled}
              className="cursor-pointer"
            >
              {isCreating && <Spinner data-icon="inline-start" />}
              {isCreating ? "Đang tạo nhóm..." : "Tạo nhóm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
