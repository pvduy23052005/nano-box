"use client";

import { useReceiveFriendRequest } from "./useReceiveFriendRequest";

export default function UserSocketListener() {
  useReceiveFriendRequest();

  return null;
}
