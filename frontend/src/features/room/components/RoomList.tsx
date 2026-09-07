"use client";

import RoomSkeleton from "./RoomSkeleton";
import RoomError from "./RoomError";
import RoomEmptyState from "./RoomEmptyState";
import RoomCard from "./RoomCard";
import { useRoomStore, ChatRoom } from "../stores/useRoomStore";

interface RoomListProps {
  rooms: ChatRoom[];
  isLoading: boolean;
  error: boolean;
  emptyMessage?: string;
}

export default function RoomList({
  rooms,
  isLoading,
  error,
  emptyMessage = "Chưa có cuộc trò chuyện nào",
}: RoomListProps) {
  const { activeRoomId, setActiveRoom } = useRoomStore();

  return (
    <>
      {isLoading ? (
        <RoomSkeleton />
      ) : error ? (
        <RoomError />
      ) : rooms.length === 0 ? (
        <RoomEmptyState message={emptyMessage} />
      ) : (
        rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            isSelected={activeRoomId === room.id}
            onClick={() => setActiveRoom(room)}
          />
        ))
      )}
    </>
  );
}

export { RoomList };
