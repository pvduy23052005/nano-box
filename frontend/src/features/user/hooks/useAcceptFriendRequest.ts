import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { ACCEPT_FRIEND_REQUEST_MUTATION } from "../mutations/user.mutation";

export interface UseAcceptFriendRequestOptions {
  onSuccess?: () => unknown;
}

export const useAcceptFriendRequest = (options?: UseAcceptFriendRequestOptions) => {
  const [acceptMutation] = useMutation(ACCEPT_FRIEND_REQUEST_MUTATION);
  const [acceptingUserId, setAcceptingUserId] = useState<string | null>(null);

  const acceptRequest = async (friendId: string) => {
    if (acceptingUserId) return;
    setAcceptingUserId(friendId);
    try {
      const response = await acceptMutation({
        variables: { friendId },
      });

      const result = response.data?.acceptFriendRequest;
      if (result?.success) {
        toast.success(result.message || "Chấp nhận lời mời kết bạn thành công");
        await options?.onSuccess?.();
        return result.data;
      } else {
        throw new Error(result?.message || "Không thể chấp nhận lời mời");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi chấp nhận lời mời";
      toast.error(message);
      throw error;
    } finally {
      setAcceptingUserId(null);
    }
  };

  return {
    acceptRequest,
    acceptingUserId,
    isAccepting: (friendId: string) => acceptingUserId === friendId,
  };
};
