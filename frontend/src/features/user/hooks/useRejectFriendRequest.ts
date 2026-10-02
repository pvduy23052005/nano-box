import {
  GET_RECEIVED_FRIEND_REQUESTS_QUERY,
  REJECT_FRIEND_REQUEST_MUTATION,
} from "../mutations/user.mutation";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";

export interface UseRejectFriendRequestOptions {
  onSuccess?: () => unknown;
}

export const useRejectFriendRequest = (options?: UseRejectFriendRequestOptions) => {
  const [rejectMutation] = useMutation(REJECT_FRIEND_REQUEST_MUTATION);

  const rejectRequest = async (friendId: string) => {
    try {
      const response = await rejectMutation({
        variables: { friendId },
        optimisticResponse: {
          rejectFriendRequest: {
            success: true,
            message: "Từ chối lời mời kết bạn thành công",
            data: {
              id: `temp-${friendId}`,
              requesterId: friendId,
              addresseeId: "",
              status: "REJECTED",
            },
          },
        },
        update(cache) {
          cache.updateQuery(
            { query: GET_RECEIVED_FRIEND_REQUESTS_QUERY },
            (prev) => {
              if (!prev?.getReceivedFriendRequests) return prev;
              return {
                ...prev,
                getReceivedFriendRequests: prev.getReceivedFriendRequests.filter(
                  (request) => request.sender.id !== friendId
                ),
              };
            }
          );
        },
      });

      const result = response.data?.rejectFriendRequest;
      if (result?.success) {
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
    }
  };

  return {
    rejectRequest,
  };
};
