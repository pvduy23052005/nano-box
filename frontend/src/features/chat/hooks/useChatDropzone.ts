import { useState, useRef, useEffect, useCallback } from "react";
import { useChatDropStore } from "../stores/useChatDropStore";

interface UseChatDropzoneOptions {
  enabled?: boolean;
}

export function useChatDropzone({ enabled = true }: UseChatDropzoneOptions = {}) {
  const [rawIsDraggingOver, setRawIsDraggingOver] = useState(false);
  const dragCounterRef = useRef(0);

  const isDraggingOver = enabled && rawIsDraggingOver;

  const isFileDrag = (e: React.DragEvent): boolean => {
    return Boolean(
      e.dataTransfer?.types &&
      Array.from(e.dataTransfer.types).includes("Files"),
    );
  };

  useEffect(() => {
    const handleDragEnd = () => {
      dragCounterRef.current = 0;
      setRawIsDraggingOver(false);
    };

    window.addEventListener("dragend", handleDragEnd);
    return () => {
      window.removeEventListener("dragend", handleDragEnd);
    };
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      if (!enabled || !isFileDrag(e)) return;
      e.preventDefault();
      dragCounterRef.current += 1;
      if (dragCounterRef.current === 1) {
        setRawIsDraggingOver(true);
      }
    },
    [enabled],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!enabled || !isFileDrag(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },
    [enabled],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (!enabled || !isFileDrag(e)) return;
      e.preventDefault();
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) {
        setRawIsDraggingOver(false);
      }
    },
    [enabled],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (!enabled || !isFileDrag(e)) return;
      e.preventDefault();
      dragCounterRef.current = 0;
      setRawIsDraggingOver(false);

      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) {
        useChatDropStore.getState().emitDropFiles(files);
      }
    },
    [enabled],
  );

  return {
    isDraggingOver,
    dropzoneProps: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
