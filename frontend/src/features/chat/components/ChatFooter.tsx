"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

import { useSendMessage } from "../hooks/useSendMessage";
import { useSendTyping } from "../hooks/useSendTyping";
import { Button } from "@/src/components/ui/button";
import ChatEmojiPicker from "./ChatEmojiPicker";
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
} from "lucide-react";

export default function ChatFooter() {
  const { sendMessage } = useSendMessage();
  const { sendTyping, stopTyping } = useSendTyping();

  const editor = useEditor({
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
        placeholder: "Nhập tin nhắn...",
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
          const textContent = view.state.doc.textContent.trim();
          if (!textContent && view.state.doc.content.size <= 2) {
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
    },
    onUpdate: ({ editor: currentEditor }) => {
      const text = currentEditor.getText().trim();
      if (text) {
        sendTyping();
      } else {
        stopTyping();
      }
    },
    immediatelyRender: false,
  });

  const handleSend = () => {
    if (!editor) return;
    const textContent = editor.getText().trim();
    if (!textContent && editor.isEmpty) {
      return;
    }
    stopTyping();
    const htmlContent = editor.getHTML();
    sendMessage(htmlContent);
    editor.commands.clearContent();
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
    <div className="bg-background/80 p-2">
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

        <div className="max-h-[140px] overflow-y-auto">
          <EditorContent editor={editor} />
        </div>

        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-1">
            <ChatEmojiPicker onSelect={handleEmojiSelect} />

            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="size-10 text-muted-foreground hover:text-foreground"
            >
              <AtSign className="size-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="size-10 text-muted-foreground hover:text-foreground"
            >
              <FileText className="size-5" />
            </Button>
            <Button
              id="chat-send-btn"
              variant="ghost"
              size="icon"
              type="button"
              className="size-10 text-primary hover:text-primary/80"
              onClick={handleSend}
            >
              <SendHorizontal className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
