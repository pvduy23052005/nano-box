import { ReactRenderer } from "@tiptap/react";
import tippy, { Instance as TippyInstance } from "tippy.js";
import { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";
import { useRoomStore } from "@/src/features/room/stores/useRoomStore";
import { useAuthStore } from "@/src/features/auth/store/useAuthStore";
import {
  MentionList,
  MentionListProps,
  MentionListRef,
  MentionSuggestionItem,
} from "./MentionList";

const roomMembersCache = new Map<string, MentionSuggestionItem[]>();
let hasActiveSuggestions = false;
let activePopup: TippyInstance[] | null = null;

export const isMentionSuggestionOpen = (): boolean => {
  return (
    hasActiveSuggestions &&
    Boolean(activePopup?.[0] && !activePopup[0].state.isDestroyed)
  );
};

export const updateSuggestionMembers = (
  roomId: string,
  members: MentionSuggestionItem[],
): void => {
  roomMembersCache.set(roomId, members);
};

export const clearSuggestionMembers = (roomId?: string): void => {
  if (roomId) {
    roomMembersCache.delete(roomId);
  } else {
    roomMembersCache.clear();
  }
};

export const mentionSuggestion = {
  items: ({ query }: { query: string }): MentionSuggestionItem[] => {
    const activeRoomId = useRoomStore.getState().activeRoomId;
    const currentUserId = useAuthStore.getState().user?.id;
    const members = (activeRoomId && roomMembersCache.get(activeRoomId)) || [];
    const normalizedQuery = query.toLowerCase().trim();

    return members
      .filter((member) => member.id !== currentUserId)
      .filter((member) => {
        if (!normalizedQuery) return true;
        return member.name.toLowerCase().includes(normalizedQuery);
      })
      .slice(0, 6);
  },

  render: () => {
    let component: ReactRenderer<MentionListRef, MentionListProps> | null = null;
    let popup: TippyInstance[] | null = null;

    return {
      onStart: (props: SuggestionProps<MentionSuggestionItem>) => {
        hasActiveSuggestions = (props.items?.length ?? 0) > 0;
        component = new ReactRenderer(MentionList, {
          props: {
            items: props.items,
            command: props.command,
          },
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        const rectFn = props.clientRect;
        popup = tippy("body", {
          getReferenceClientRect: () => rectFn() || new DOMRect(),
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "top-start",
        });
        activePopup = popup;
      },

      onUpdate: (props: SuggestionProps<MentionSuggestionItem>) => {
        hasActiveSuggestions = (props.items?.length ?? 0) > 0;
        component?.updateProps({
          items: props.items,
          command: props.command,
        });

        if (props.clientRect && popup?.[0]) {
          const rectFn = props.clientRect;
          popup[0].setProps({
            getReferenceClientRect: () => rectFn() || new DOMRect(),
          });
        }
        activePopup = popup;
      },

      onKeyDown: (props: SuggestionKeyDownProps): boolean => {
        if (props.event.key === "Escape") {
          hasActiveSuggestions = false;
          popup?.[0]?.hide();
          return true;
        }

        return component?.ref?.onKeyDown({ event: props.event }) ?? false;
      },

      onExit: () => {
        hasActiveSuggestions = false;
        activePopup = null;
        popup?.[0]?.destroy();
        component?.destroy();
      },
    };
  },
};
