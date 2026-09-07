"use client";

import RoomList from "./RoomList";
import { useGetRooms } from "../hooks/useGetRooms";
import { MemberStatus } from "../room.type";
import { ChatRoom } from "../stores/useRoomStore";

interface RoomFriendProps {
  rooms?: ChatRoom[];
  isLoading?: boolean;
  error?: boolean;
}

export default function RoomFriend({
  rooms: propRooms,
  isLoading: propIsLoading,
  error: propError,
}: RoomFriendProps) {
  const queryResult = useGetRooms(MemberStatus.ACCEPTED);

  const rooms = propRooms ?? (queryResult.rooms as ChatRoom[]);
  const isLoading = propIsLoading ?? queryResult.loading;
  const error = propError ?? !!queryResult.error;

  return (
    <RoomList
      rooms={rooms}
      isLoading={isLoading}
      error={error}
      emptyMessage="Chưa có cuộc trò chuyện nào"
    />
  );
}

export { RoomFriend };
