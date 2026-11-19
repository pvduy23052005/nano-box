import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { CANCEL_FRIEND_REQUEST_MUTATION } from "../mutations/user.mutation";
import { useSentRequestsStore } from "../stores/useSentRequestsStore";

export const useCancelFriendRequest = () => {
  const [cancelFriendRequestMutation] = useMutation(
    CANCEL_FRIEND_REQUEST_MUTATION
  );
  const removeSentRequest = useSentRequestsStore((state) => state.removeSentRequest);
  const addSentRequest = useSentRequestsStore((state) => state.addSentRequest);

  const cancelFriendRequest = async (friendId: string) => {
    const state = useSentRequestsStore.getState();
    const requestToRestore = state.sentRequests.find(request => request.id === friendId);

    removeSentRequest(friendId);

    try {
      const response = await cancelFriendRequestMutation({
        variables: { friendId },
        optimisticResponse: {
          cancelFriendRequest: {
            success: true,
            message: "Hủy lời mời kết bạn thành công",
            data: {
              id: `temp-${friendId}`,
              requesterId: "",
              addresseeId: friendId,
              status: "CANCELLED",
            },
          },
        },
      });

      const result = response.data?.cancelFriendRequest;
      if (result?.success) {
        // toast.success(result.message || "Hủy lời mời kết bạn thành công");
        return result.data;
      } else {
        throw new Error(result?.message || "Không thể hủy lời mời kết bạn");
      }
    } catch (error: unknown) {
      if (requestToRestore) {
        addSentRequest(requestToRestore);
      }

      const message =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi hủy lời mời kết bạn";
      toast.error(message);
      throw error;
    }
  };

  return {
    cancelFriendRequest,
  };
};
