import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { SEND_FRIEND_REQUEST_MUTATION } from "../mutations/user.mutation";

export const useSendFriendRequest = () => {
  const [sendFriendRequestMutation] = useMutation(SEND_FRIEND_REQUEST_MUTATION);
  const [sendingUserId, setSendingUserId] = useState<string | null>(null);
  const [sentUserIds, setSentUserIds] = useState<Set<string>>(new Set());

  const sendFriendRequest = async (addresseeId: string) => {
    if (sendingUserId) return;
    if (sentUserIds.has(addresseeId)) {
      toast.info("Bạn đã gửi lời mời kết bạn cho người này rồi");
      return;
    }

    setSendingUserId(addresseeId);
    try {
      const response = await sendFriendRequestMutation({
        variables: { addresseeId },
      });

      const result = response.data?.sendFriendRequest;
      if (result?.success) {
        setSentUserIds((prev) => new Set(prev).add(addresseeId));
        toast.success(result.message || "Gửi lời mời kết bạn thành công");
        return result.data;
      } else {
        throw new Error(result?.message || "Không thể gửi lời mời kết bạn");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi gửi lời mời kết bạn";
      toast.error(message);
      throw error;
    } finally {
      setSendingUserId(null);
    }
  };

  return {
    sendFriendRequest,
    sendingUserId,
    sentUserIds,
    isSending: (userId: string) => sendingUserId === userId,
    isSent: (userId: string) => sentUserIds.has(userId),
  };
};
