import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { CANCEL_FRIEND_REQUEST_MUTATION } from "../mutations/user.mutation";
import { useSentRequestsStore } from "../stores/useSentRequestsStore";

export const useCancelFriendRequest = () => {
  const [cancelFriendRequestMutation] = useMutation(
    CANCEL_FRIEND_REQUEST_MUTATION
  );
  const [cancellingUserId, setCancellingUserId] = useState<string | null>(null);
  const removeSentRequest = useSentRequestsStore(
    (state) => state.removeSentRequest
  );

  const cancelFriendRequest = async (friendId: string) => {
    if (cancellingUserId) return;
    setCancellingUserId(friendId);
    try {
      const response = await cancelFriendRequestMutation({
        variables: { friendId },
      });

      const result = response.data?.cancelFriendRequest;
      if (result?.success) {
        removeSentRequest(friendId);
        toast.success(result.message || "Hủy lời mời kết bạn thành công");
        return result.data;
      } else {
        throw new Error(result?.message || "Không thể hủy lời mời kết bạn");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi hủy lời mời kết bạn";
      toast.error(message);
      throw error;
    } finally {
      setCancellingUserId(null);
    }
  };

  return {
    cancelFriendRequest,
    cancellingUserId,
    isCancelling: (userId: string) => cancellingUserId === userId,
  };
};
