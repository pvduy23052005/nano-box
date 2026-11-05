"use client";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Download from "yet-another-react-lightbox/plugins/download";
import "yet-another-react-lightbox/styles.css";
import { useLightboxStore } from "../stores/useLightboxStore";

export default function ChatLightbox() {
  const isOpen = useLightboxStore((state) => state.isOpen);
  const index = useLightboxStore((state) => state.index);
  const slides = useLightboxStore((state) => state.slides);
  const closeLightbox = useLightboxStore((state) => state.closeLightbox);
  const setIndex = useLightboxStore((state) => state.setIndex);

  if (!isOpen || slides.length === 0) return null;

  return (
    <Lightbox
      open={isOpen}
      index={index}
      close={closeLightbox}
      slides={slides}
      on={{
        view: ({ index: newIndex }) => setIndex(newIndex),
      }}
      plugins={[Zoom, Fullscreen, Download]}
    />
  );
}
