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
  const activeRoomId = useRoomStore((state) => state.activeRoomId);
  const setActiveRoom = useRoomStore((state) => state.setActiveRoom);

  if (isLoading && rooms.length === 0) return <RoomSkeleton />;

  if (error) return <RoomError />;

  if (rooms.length === 0) return <RoomEmptyState message={emptyMessage} />;

  return (
    <>
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          isSelected={activeRoomId === room.id}
          onClick={() => setActiveRoom(room)}
        />
      ))}
    </>
  );
}
