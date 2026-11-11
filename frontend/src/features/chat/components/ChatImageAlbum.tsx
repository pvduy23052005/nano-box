"use client";

import { cn } from "@/src/lib/utils";

interface ChatImageAlbumProps {
  images: string[];
  onImageClick: (index: number) => void;
  className?: string;
}

export default function ChatImageAlbum({
  images,
  onImageClick,
  className,
}: ChatImageAlbumProps) {
  const count = images.length;
  if (count === 0) return null;

  if (count === 1) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl cursor-pointer bg-muted/40 min-w-[140px] min-h-[100px] max-w-[280px] sm:max-w-[360px]",
          className,
        )}
        onClick={() => onImageClick(0)}
      >
        <img
          src={images[0]}
          alt="attachment-0"
          className="rounded-xl max-h-72 sm:max-h-80 max-w-[280px] sm:max-w-[360px] w-auto h-auto object-cover hover:opacity-95 transition-opacity block"
          loading="lazy"
        />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div
        className={cn(
          "grid grid-cols-2 gap-1.5 w-[280px] sm:w-[340px] max-w-full h-44 sm:h-52 rounded-xl overflow-hidden bg-muted/20",
          className,
        )}
      >
        {images.map((url, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden cursor-pointer bg-muted group h-full w-full"
            onClick={() => onImageClick(idx)}
          >
            <img
              src={url}
              alt={`attachment-${idx}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 block"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div
        className={cn(
          "grid grid-cols-2 grid-rows-2 gap-1.5 w-[280px] sm:w-[340px] max-w-full h-64 sm:h-72 rounded-xl overflow-hidden bg-muted/20",
          className,
        )}
      >
        <div
          className="relative row-span-2 col-span-1 overflow-hidden cursor-pointer bg-muted group h-full w-full"
          onClick={() => onImageClick(0)}
        >
          <img
            src={images[0]}
            alt="attachment-0"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 block"
            loading="lazy"
          />
        </div>
        <div
          className="relative row-span-1 col-span-1 overflow-hidden cursor-pointer bg-muted group h-full w-full"
          onClick={() => onImageClick(1)}
        >
          <img
            src={images[1]}
            alt="attachment-1"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 block"
            loading="lazy"
          />
        </div>
        <div
          className="relative row-span-1 col-span-1 overflow-hidden cursor-pointer bg-muted group h-full w-full"
          onClick={() => onImageClick(2)}
        >
          <img
            src={images[2]}
            alt="attachment-2"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 block"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  const displayImages = images.slice(0, 4);
  const extraCount = images.length - 3;

  return (
    <div
      className={cn(
        "grid grid-cols-2 grid-rows-2 gap-1.5 w-[280px] sm:w-[340px] max-w-full h-64 sm:h-72 rounded-xl overflow-hidden bg-muted/20",
        className,
      )}
    >
      {displayImages.map((url, idx) => {
        const isLastSlot = idx === 3;
        const hasExtra = count > 4;

        return (
          <div
            key={idx}
            className="relative overflow-hidden cursor-pointer bg-muted group h-full w-full"
            onClick={() => onImageClick(idx)}
          >
            <img
              src={url}
              alt={`attachment-${idx}`}
              className={cn(
                "w-full h-full object-cover transition-transform duration-200 block",
                !isLastSlot || !hasExtra ? "group-hover:scale-105" : "",
              )}
              loading="lazy"
            />
            {isLastSlot && hasExtra && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-xl sm:text-2xl group-hover:bg-black/70 transition-colors">
                +{extraCount}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
