"use client";

import RoomList from "./RoomList";
import { ChatRoom } from "../stores/useRoomStore";

interface RoomStrangerProps {
  rooms: ChatRoom[];
  isLoading: boolean;
  error: boolean;
}

export default function RoomStranger({
  rooms,
  isLoading,
  error,
}: RoomStrangerProps) {
  return (
    <RoomList
      rooms={rooms}
      isLoading={isLoading}
      error={error}
      emptyMessage="Không có tin nhắn từ người lạ"
    />
  );
}
