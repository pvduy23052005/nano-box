import {
  computeOptimisticReactions,
  getMessageFromCache,
  updateMessageReactionInCache,
} from "../utils/chatCache";
import { toast } from "sonner";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { ADD_EMOJI_MESSAGE_MUTATION, GET_MESSAGE_QUERY } from "../mutation/mutation";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useRoomStore } from "../../room/stores/useRoomStore";

export const useAddEmojiMessage = () => {
  const { user } = useAuthStore();
  const { activeRoomId } = useRoomStore();
  const client = useApolloClient();
  const [addEmojiMutation] = useMutation(ADD_EMOJI_MESSAGE_MUTATION);

  const addEmoji = async (messageId: string, emoji: string) => {
    if (!user || !messageId || !activeRoomId) return;

    try {
      const currentMsg = getMessageFromCache(
        client.cache,
        GET_MESSAGE_QUERY,
        activeRoomId,
        messageId,
      );

      const targetRoomId = currentMsg?.roomId || activeRoomId;
      const optimisticReactions = computeOptimisticReactions(
        currentMsg?.reactions ?? [],
        emoji,
        user.id,
      );

      await addEmojiMutation({
        variables: {
          input: {
            messageId,
            emoji,
            userName: user.name,
            userAvatar: user.avatar ?? null,
          },
        },
        optimisticResponse: {
          addEmojiMessage: {
            id: messageId,
            content: currentMsg?.content ?? "",
            senderId: currentMsg?.senderId ?? "",
            senderAvatar: currentMsg?.senderAvatar ?? currentMsg?.avatar ?? null,
            senderName: currentMsg?.senderName ?? null,
            avatar: currentMsg?.avatar ?? currentMsg?.senderAvatar ?? null,
            roomId: targetRoomId,
            attachments: currentMsg?.attachments ?? [],
            reactions: optimisticReactions.map((reaction) => ({
              emoji: reaction.emoji,
              userIds: reaction.userIds,
            })),
          },
        },
        update: (cache, { data }) => {
          if (!data?.addEmojiMessage) return;
          const updatedMessage = data.addEmojiMessage;
          const roomId = updatedMessage.roomId || targetRoomId;

          updateMessageReactionInCache(
            cache,
            GET_MESSAGE_QUERY,
            roomId,
            updatedMessage.id,
            updatedMessage.reactions,
          );
        },
      });
    } catch (err) {
      const errorMessage =
        (err as { graphQLErrors?: Array<{ message: string }> })?.graphQLErrors?.[0]?.message ||
        (err instanceof Error ? err.message : null) ||
        "Không thể thả cảm xúc. Vui lòng thử lại!";
      toast.error(errorMessage);
    }
  };

  return { addEmoji };
};
