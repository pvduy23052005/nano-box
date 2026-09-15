import RoomList from "./RoomList";
import { ChatRoom } from "../stores/useRoomStore";

interface RoomFriendProps {
  rooms: ChatRoom[];
  isLoading: boolean;
  error: boolean;
}

export default function RoomFriend({
  rooms,
  isLoading,
  error,
}: RoomFriendProps) {
  return (
    <RoomList
      rooms={rooms}
      isLoading={isLoading}
      error={error}
      emptyMessage="Chưa có cuộc trò chuyện"
    />
  );
}
