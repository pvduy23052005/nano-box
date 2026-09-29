import RoomList from "./RoomList";
import { ChatRoom } from "../stores/useRoomStore";

interface RoomFriendProps {
  rooms: ChatRoom[];
  isLoading: boolean;
  error: boolean;
  emptyMessage?: string;
}

export default function RoomFriend({
  rooms,
  isLoading,
  error,
  emptyMessage = "Chưa có cuộc trò chuyện",
}: RoomFriendProps) {
  return (
    <RoomList
      rooms={rooms}
      isLoading={isLoading}
      error={error}
      emptyMessage={emptyMessage}
    />
  );
}
