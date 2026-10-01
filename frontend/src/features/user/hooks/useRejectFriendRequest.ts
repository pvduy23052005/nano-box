import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { REJECT_FRIEND_REQUEST_MUTATION } from "../mutations/user.mutation";

export interface UseRejectFriendRequestOptions {
  onSuccess?: () => unknown;
}

export const useRejectFriendRequest = (options?: UseRejectFriendRequestOptions) => {
  const [rejectMutation] = useMutation(REJECT_FRIEND_REQUEST_MUTATION);
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);

  const rejectRequest = async (friendId: string) => {
    if (rejectingUserId) return;
    setRejectingUserId(friendId);
    try {
      const response = await rejectMutation({
        variables: { friendId },
      });

      const result = response.data?.rejectFriendRequest;
      if (result?.success) {
        toast.success(result.message || "Từ chối lời mời kết bạn thành công");
        await options?.onSuccess?.();
        return result.data;
      } else {
        throw new Error(result?.message || "Không thể từ chối lời mời");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi từ chối lời mời";
      toast.error(message);
      throw error;
    } finally {
      setRejectingUserId(null);
    }
  };

  return {
    rejectRequest,
    rejectingUserId,
    isRejecting: (friendId: string) => rejectingUserId === friendId,
  };
};
