import { create } from "zustand";

type DropHandler = (files: File[]) => void;

interface ChatDropState {
  dropHandler: DropHandler | null;
  registerDropHandler: (handler: DropHandler) => () => void;
  emitDropFiles: (files: File[]) => void;
}

export const useChatDropStore = create<ChatDropState>((set, get) => ({
  dropHandler: null,
  registerDropHandler: (handler) => {
    set({ dropHandler: handler });
    return () => {
      if (get().dropHandler === handler) {
        set({ dropHandler: null });
      }
    };
  },
  emitDropFiles: (files) => {
    const handler = get().dropHandler;
    if (handler && files.length > 0) {
      handler(files);
    }
  },
}));
