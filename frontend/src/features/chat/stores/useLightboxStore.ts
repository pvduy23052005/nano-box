import { create } from "zustand";

export interface LightboxSlide {
  src: string;
  alt?: string;
  [key: string]: unknown;
}

interface LightboxState {
  isOpen: boolean;
  index: number;
  slides: LightboxSlide[];
  openLightbox: (slides: LightboxSlide[], index?: number) => void;
  closeLightbox: () => void;
  setIndex: (index: number) => void;
}

export const useLightboxStore = create<LightboxState>((set) => ({
  isOpen: false,
  index: 0,
  slides: [],
  openLightbox: (slides, index = 0) =>
    set({
      isOpen: true,
      slides,
      index: Math.max(0, index),
    }),
  closeLightbox: () =>
    set({
      isOpen: false,
      index: -1,
      slides: [],
    }),
  setIndex: (index) => set({ index }),
}));
