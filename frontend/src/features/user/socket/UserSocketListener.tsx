"use client";

import { useReceiveFriendRequest } from "./useReceiveFriendRequest";
import { useReceivePresence } from "./useReceivePresence";

export default function UserSocketListener() {
  useReceiveFriendRequest();
  useReceivePresence();

  return null;
}

