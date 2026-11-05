import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { SEND_FRIEND_REQUEST_MUTATION } from "../mutations/user.mutation";
import { useSentRequestsStore } from "../stores/useSentRequestsStore";

export interface SendFriendTarget {
  id: string;
  name?: string;
  email?: string;
  avatar?: string | null;
}

export const useSendFriendRequest = () => {
  const [sendFriendRequestMutation] = useMutation(SEND_FRIEND_REQUEST_MUTATION);
  const { sentRequests, addSentRequest, removeSentRequest, isSent } = useSentRequestsStore();

  const sendFriendRequest = async (target: string | SendFriendTarget) => {
    const addresseeId = typeof target === "string" ? target : target.id;
    
    if (isSent(addresseeId)) {
      toast.info("Bạn đã gửi lời mời kết bạn cho người này rồi");
      return;
    }

    addSentRequest(
      typeof target === "string"
        ? { id: target, name: "Người dùng" }
        : {
            id: target.id,
            name: target.name || "Người dùng",
            email: target.email,
            avatar: target.avatar,
          }
    );

    try {
      const response = await sendFriendRequestMutation({
        variables: { addresseeId },
        optimisticResponse: {
          sendFriendRequest: {
            success: true,
            message: "Gửi lời mời kết bạn thành công",
            data: {
              id: `temp-${addresseeId}`,
              requesterId: "",
              addresseeId,
              status: "PENDING",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        },
      });

      const result = response.data?.sendFriendRequest;
      if (result?.success) {
        toast.success(result.message || "Gửi lời mời kết bạn thành công");
        return result.data;
      } else {
        throw new Error(result?.message || "Không thể gửi lời mời kết bạn");
      }
    } catch (error: unknown) {
      removeSentRequest(addresseeId);
      
      const message =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi gửi lời mời kết bạn";
      toast.error(message);
      throw error;
    }
  };

  return {
    sendFriendRequest,
    sentRequests,
    isSent,
  };
};
