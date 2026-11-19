import { useEffect, useRef, useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { UPDATE_MEMBER_LAST_READ_MESSAGE_MUTATION } from "../../room/room.mutation";
import { Message } from "../types/chat.types";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useReadReceiptStore } from "../stores/useReadReceiptStore";

export const useMarkAsRead = (
  activeRoomId?: string | null,
  messages?: Message[],
) => {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const setMemberLastRead = useReadReceiptStore(
    (state) => state.setMemberLastRead,
  );
  const [updateMemberLastReadMessage] = useMutation(
    UPDATE_MEMBER_LAST_READ_MESSAGE_MUTATION,
  );

  const lastMarkedMessageIdRef = useRef<Record<string, string>>({});

  const markLatestAsRead = useCallback(() => {
    if (!activeRoomId || !messages?.length || !currentUserId) return;
    if (typeof document !== "undefined" && document.visibilityState !== "visible") {
      return;
    }

    const latestMessage = [...messages]
      .reverse()
      .find((msg) => !msg.id.startsWith("temp-"));

    if (!latestMessage?.id) return;

    const previousMarked = lastMarkedMessageIdRef.current[activeRoomId];
    if (previousMarked && latestMessage.id <= previousMarked) {
      return;
    }

    lastMarkedMessageIdRef.current[activeRoomId] = latestMessage.id;
    setMemberLastRead(activeRoomId, currentUserId, latestMessage.id);

    updateMemberLastReadMessage({
      variables: {
        roomId: activeRoomId,
        messageId: latestMessage.id,
      },
    }).catch(() => {});
  }, [activeRoomId, messages, currentUserId, setMemberLastRead, updateMemberLastReadMessage]);

  useEffect(() => {
    markLatestAsRead();
  }, [markLatestAsRead]);

  useEffect(() => {
    const handleFocusOrVisible = () => {
      if (document.visibilityState === "visible") {
        markLatestAsRead();
      }
    };

    window.addEventListener("focus", handleFocusOrVisible);
    document.addEventListener("visibilitychange", handleFocusOrVisible);

    return () => {
      window.removeEventListener("focus", handleFocusOrVisible);
      document.removeEventListener("visibilitychange", handleFocusOrVisible);
    };
  }, [markLatestAsRead]);
};
