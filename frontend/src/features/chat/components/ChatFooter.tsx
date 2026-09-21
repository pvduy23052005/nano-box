"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

import { useSendMessage } from "../hooks/useSendMessage";
import { useSendTyping } from "../hooks/useSendTyping";
import { useRoomStore } from "../../room/stores/useRoomStore";
import { Button } from "@/src/components/ui/button";
import ChatEmojiPicker from "./ChatEmojiPicker";
import ChatImagePreview, {
  PendingImage,
  UploadStatus,
} from "./ChatImagePreview";
import { uploadTempFile } from "@/src/services/upload.service";
import { useRef, useState, useEffect } from "react";
import {
  AtSign,
  FileText,
  SendHorizontal,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  ListOrdered,
  List,
  Outdent,
  Image as ImageIcon,
} from "lucide-react";

export default function ChatFooter() {
  const { activeRoomId } = useRoomStore();
  const { sendMessage } = useSendMessage();
  const { sendTyping, stopTyping } = useSendTyping(activeRoomId ?? undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<PendingImage[]>([]);
  const uploadPromisesRef = useRef(
    new Map<string, Promise<{ tempKey: string; url: string } | null>>(),
  );

  const handleSelectFiles = (files: File[]) => {
    if (!files.length) return;

    const newImages: PendingImage[] = files.map((file) => {
      const isImg = file.type.startsWith("image/");
      const objectUrl = URL.createObjectURL(file);
      const previewUrl = isImg
        ? objectUrl
        : `${objectUrl}#name=${encodeURIComponent(file.name)}&size=${file.size}`;

      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        previewUrl,
        status: UploadStatus.UPLOADING,
      };
    });

    setImages((prev) => [...prev, ...newImages]);

    newImages.forEach((item) => {
      const promise = uploadTempFile(item.file)
        .then((result) => {
          setImages((prev) =>
            prev.map((img) =>
              img.id === item.id
                ? {
                    ...img,
                    status: UploadStatus.SUCCESS,
                    uploadedUrl: result.url,
                    tempKey: result.tempKey,
                  }
                : img,
            ),
          );
          return result;
        })
        .catch((err: unknown) => {
          const errorMsg =
            err instanceof Error ? err.message : "Tải ảnh thất bại";
          setImages((prev) =>
            prev.map((img) =>
              img.id === item.id
                ? { ...img, status: UploadStatus.ERROR, errorMessage: errorMsg }
                : img,
            ),
          );
          return null;
        });

      uploadPromisesRef.current.set(item.id, promise);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleSelectFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const handleRemoveImage = (id: string) => {
    uploadPromisesRef.current.delete(id);
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl.split("#")[0]);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const editor = useEditor({
    editable: Boolean(activeRoomId),
    extensions: [
      StarterKit,
      UnderlineExtension,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "underline cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder: activeRoomId
          ? "Nhập tin nhắn..."
          : "Chọn một cuộc trò chuyện để bắt đầu",
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "w-full min-h-[44px] border-0 bg-transparent p-3 text-sm outline-none placeholder:text-muted-foreground",
      },
      handleKeyDown: (view, event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          if (!activeRoomId) return true;
          const textContent = view.state.doc.textContent.trim();
          if (
            !textContent &&
            view.state.doc.content.size <= 2 &&
            images.length === 0
          ) {
            return true;
          }
          const sendBtn = document.getElementById("chat-send-btn");
          if (sendBtn) {
            sendBtn.click();
          }
          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        const pastedFiles: File[] = [];
        for (let i = 0; i < items.length; i++) {
          const file = items[i].getAsFile();
          if (file) pastedFiles.push(file);
        }
        if (pastedFiles.length > 0) {
          event.preventDefault();
          handleSelectFiles(pastedFiles);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      if (!activeRoomId) return;
      const text = currentEditor.getText().trim();
      if (text) {
        sendTyping();
      } else {
        stopTyping();
      }
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(Boolean(activeRoomId));
    }
  }, [activeRoomId, editor]);

  const handleSend = () => {
    if (!editor || !activeRoomId) return;
    const textContent = editor.getText().trim();
    const pendingImages = images.filter(
      (img) => img.status !== UploadStatus.ERROR,
    );

    if (!textContent && editor.isEmpty && pendingImages.length === 0) return;

    stopTyping();
    const htmlContent = editor.isEmpty ? "" : editor.getHTML();

    const previewUrls = pendingImages.map((img) => img.previewUrl);

    const promises = pendingImages
      .map((img) => uploadPromisesRef.current.get(img.id))
      .filter(
        (p): p is Promise<{ tempKey: string; url: string } | null> => !!p,
      );
    pendingImages.forEach((img) => uploadPromisesRef.current.delete(img.id));

    const tempKeysPromise = Promise.all(promises).then((results) =>
      results
        .filter((r): r is { tempKey: string; url: string } => r !== null)
        .map((r) => r.tempKey),
    );

    editor.commands.clearContent();
    setImages([]);

    sendMessage(htmlContent, tempKeysPromise, previewUrls, activeRoomId);
  };

  const handleEmojiSelect = (emoji: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(emoji).run();
    sendTyping();
  };

  const handleSetLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Nhập đường dẫn (URL):", previousUrl);
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="bg-background/80 p-2 shrink-0 border-t sm:border-t-0">
      <div className="flex flex-col bg-card border rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-ring">
        <div className="flex items-center gap-0.5 p-2 border-b bg-muted/30 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className={`size-8 text-muted-foreground hover:text-foreground ${
              editor?.isActive("bold")
                ? "bg-accent text-accent-foreground font-bold"
                : ""
            }`}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold className="size-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className={`size-8 text-muted-foreground hover:text-foreground ${
              editor?.isActive("italic")
                ? "bg-accent text-accent-foreground font-bold"
                : ""
            }`}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic className="size-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className={`size-8 text-muted-foreground hover:text-foreground ${
              editor?.isActive("underline")
                ? "bg-accent text-accent-foreground font-bold"
                : ""
            }`}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          >
            <Underline className="size-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className={`size-8 text-muted-foreground hover:text-foreground ${
              editor?.isActive("strike")
                ? "bg-accent text-accent-foreground font-bold"
                : ""
            }`}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="size-4.5" />
          </Button>

          <div className="w-[1px] h-4 bg-border mx-1 shrink-0" />

          <Button
            variant="ghost"
            size="icon"
            type="button"
            className={`size-8 text-muted-foreground hover:text-foreground ${
              editor?.isActive("link")
                ? "bg-accent text-accent-foreground font-bold"
                : ""
            }`}
            onClick={handleSetLink}
          >
            <Link className="size-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className={`size-8 text-muted-foreground hover:text-foreground ${
              editor?.isActive("orderedList")
                ? "bg-accent text-accent-foreground font-bold"
                : ""
            }`}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="size-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className={`size-8 text-muted-foreground hover:text-foreground ${
              editor?.isActive("bulletList")
                ? "bg-accent text-accent-foreground font-bold"
                : ""
            }`}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <List className="size-4.5" />
          </Button>

          <div className="w-[1px] h-4 bg-border mx-1 shrink-0" />

          <Button
            variant="ghost"
            size="icon"
            type="button"
            className={`size-8 text-muted-foreground hover:text-foreground ${
              editor?.isActive("blockquote")
                ? "bg-accent text-accent-foreground font-bold"
                : ""
            }`}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          >
            <Outdent className="size-4.5" />
          </Button>
        </div>

        <ChatImagePreview images={images} onRemove={handleRemoveImage} />

        <div className="max-h-[140px] overflow-y-auto">
          <EditorContent editor={editor} />
        </div>

        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-1">
            <ChatEmojiPicker
              onSelect={handleEmojiSelect}
              disabled={!activeRoomId}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={!activeRoomId}
              onChange={handleFileInputChange}
            />

            <Button
              variant="ghost"
              size="icon"
              type="button"
              disabled={!activeRoomId}
              className="size-10 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              title="Chọn ảnh"
            >
              <ImageIcon className="size-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              type="button"
              disabled={!activeRoomId}
              className="size-10 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => docInputRef.current?.click()}
              title="Đính kèm file"
            >
              <FileText className="size-5" />
            </Button>x

            <Button
              variant="ghost"
              size="icon"
              type="button"
              disabled={!activeRoomId}
              className="size-10 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <AtSign className="size-5" />
            </Button>

            <input
              ref={docInputRef}
              type="file"
              multiple
              className="hidden"
              disabled={!activeRoomId}
              onChange={handleFileInputChange}
            />
          </div>

          <Button
            id="chat-send-btn"
            variant="ghost"
            size="icon"
            type="button"
            disabled={!activeRoomId}
            className="size-10 text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSend}
          >
            <SendHorizontal className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
