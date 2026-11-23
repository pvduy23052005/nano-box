"use client";

import { useReceiveMessage } from "./useReceiveMessage";
import { useReceiveReaction } from "./useReceiveReaction";
import { useReceiveMessageRead } from "./useReceiveMessageRead";
import { useReceiveTyping } from "./useReceiveTyping";

export default function ChatSocketListener() {
  useReceiveMessage();
  useReceiveReaction();
  useReceiveMessageRead();
  useReceiveTyping();

  return null;
}
