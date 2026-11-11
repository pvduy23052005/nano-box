import { useMutation, useApolloClient } from "@apollo/client/react";
import { toast } from "sonner";
import { SEND_MESSAGE_MUTATION, GET_MESSAGE_QUERY } from "../mutation/mutation";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useRoomStore } from "../../room/stores/useRoomStore";
import { appendMessageToCache } from "../utils/chatCache";
import { updateRoomLastMessageInCache } from "../../room/room.cache";
import { Message } from "../types/chat.types";

export const useSendMessage = () => {
  const user = useAuthStore((state) => state.user);
  const activeRoomId = useRoomStore((state) => state.activeRoomId);
  const client = useApolloClient();
  const [sendMessageMutation] = useMutation(SEND_MESSAGE_MUTATION);

  const sendMessage = (
    content: string,
    tempKeysPromise: Promise<string[]>,
    previewUrls?: string[],
    roomId?: string,
    mentionedUserIds?: string[],
  ) => {
    const targetRoomId = (roomId || activeRoomId)?.trim();
    if (!user || !targetRoomId) return;

    const optimisticId = `temp-${Date.now()}`;

    const optimisticMsg: Message = {
      id: optimisticId,
      content,
      senderId: user.id,
      senderAvatar: user.avatar,
      senderName: user.name,
      avatar: user.avatar,
      roomId: targetRoomId,
      attachments: previewUrls ?? [],
      readBy: [],
      reactions: [],
      mentionedUserIds: mentionedUserIds ?? [],
      isMe: true,
      isSystem: false,
    };
    appendMessageToCache(client.cache, GET_MESSAGE_QUERY, optimisticMsg, undefined, targetRoomId);

    updateRoomLastMessageInCache(client.cache, targetRoomId, {
      id: optimisticId,
      content,
      senderId: user.id,
      createdAt: new Date().toISOString(),
    });

    (async () => {
      try {
        const tempKeys = await tempKeysPromise;

        await sendMessageMutation({
          variables: {
            input: {
              content,
              roomId: targetRoomId,
              senderName: user.name,
              senderAvatar: user.avatar,
              ...(tempKeys.length ? { tempKeys } : {}),
              ...(mentionedUserIds?.length ? { mentionedUserIds } : {}),
            },
          },
          update: (cache, { data }) => {
            if (!data?.sendMessage) return;
            appendMessageToCache(
              cache,
              GET_MESSAGE_QUERY,
              {
                ...data.sendMessage,
                roomId: data.sendMessage.roomId || targetRoomId,
                reactions: data.sendMessage.reactions ?? [],
                mentionedUserIds: data.sendMessage.mentionedUserIds ?? [],
                isSystem: data.sendMessage.isSystem ?? false,
                isMe: data.sendMessage.senderId === user.id,
              },
              optimisticId,
              targetRoomId,
            );

            updateRoomLastMessageInCache(cache, targetRoomId, {
              id: data.sendMessage.id,
              content: data.sendMessage.content,
              senderId: data.sendMessage.senderId,
              createdAt: new Date().toISOString(),
              mentionedUserIds: data.sendMessage.mentionedUserIds ?? [],
            });
          },
        });
      } catch {
        toast.error("Không thể gửi tin nhắn. Vui lòng thử lại!");
      }
    })();
  };

  return { sendMessage };
};

