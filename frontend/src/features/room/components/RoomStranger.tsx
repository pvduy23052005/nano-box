import RoomList from "./RoomList";
import { ChatRoom } from "../stores/useRoomStore";

interface RoomStrangerProps {
  rooms: ChatRoom[];
  isLoading: boolean;
  error: boolean;
  emptyMessage?: string;
}

export default function RoomStranger({
  rooms,
  isLoading,
  error,
  emptyMessage = "Không có tin nhắn từ người lạ",
}: RoomStrangerProps) {
  return (
    <RoomList
      rooms={rooms}
      isLoading={isLoading}
      error={error}
      emptyMessage={emptyMessage}
    />
  );
}
