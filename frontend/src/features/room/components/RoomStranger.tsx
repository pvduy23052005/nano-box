"use client";

import RoomList from "./RoomList";
import { useGetRooms } from "../hooks/useGetRooms";
import { MemberStatus } from "../room.type";
import { ChatRoom } from "../stores/useRoomStore";

interface RoomStrangerProps {
  rooms?: ChatRoom[];
  isLoading?: boolean;
  error?: boolean;
}

export default function RoomStranger({
  rooms: propRooms,
  isLoading: propIsLoading,
  error: propError,
}: RoomStrangerProps) {
  const queryResult = useGetRooms(MemberStatus.WAITTING);

  const rooms = propRooms ?? (queryResult.rooms as ChatRoom[]);
  const isLoading = propIsLoading ?? queryResult.loading;
  const error = propError ?? !!queryResult.error;

  return (
    <RoomList
      rooms={rooms}
      isLoading={isLoading}
      error={error}
      emptyMessage="Không có tin nhắn từ người lạ"
    />
  );
}

export { RoomStranger };
