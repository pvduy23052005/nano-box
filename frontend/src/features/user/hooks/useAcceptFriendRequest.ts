import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import {
  ACCEPT_FRIEND_REQUEST_MUTATION,
  GET_RECEIVED_FRIEND_REQUESTS_QUERY,
} from "../mutations/user.mutation";

export interface UseAcceptFriendRequestOptions {
  onSuccess?: () => unknown;
}

export const useAcceptFriendRequest = (options?: UseAcceptFriendRequestOptions) => {
  const [acceptMutation] = useMutation(ACCEPT_FRIEND_REQUEST_MUTATION);

  const acceptRequest = async (friendId: string) => {
    try {
      const response = await acceptMutation({
        variables: { friendId },
        optimisticResponse: {
          acceptFriendRequest: {
            success: true,
            message: "Chấp nhận lời mời kết bạn thành công",
            data: {
              id: `temp-${friendId}`,
              requesterId: friendId,
              addresseeId: "",
              status: "ACCEPTED",
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

      const result = response.data?.acceptFriendRequest;
      if (result?.success) {
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
    }
  };

  return {
    acceptRequest,
  };
};
