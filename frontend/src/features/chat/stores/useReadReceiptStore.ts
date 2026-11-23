import { create } from "zustand";

interface ReadReceiptState {
  /**
   * Lưu trữ mốc tin nhắn đã đọc theo từng phòng và từng user.
   * Cấu trúc: { [roomId]: { [userId]: messageId } }
   * Ví dụ: { "room_1": { "user_A": "msg_100", "user_B": "msg_105" } }
   */
  readByRoom: Record<string, Record<string, string>>;

  /**
   * Cập nhật mốc tin nhắn đã đọc mới nhất của một user trong phòng.
   */
  setMemberLastRead: (
    roomId: string,
    userId: string,
    messageId: string,
  ) => void;

  /**
   * Lấy ID tin nhắn mới nhất mà các thành viên KHÁC trong phòng đã đọc.
   * Dùng để kiểm tra xem tin nhắn mình gửi đã được đối phương đọc hay chưa (hiển thị "Đã xem").
   */
  getOtherMembersMaxReadMessageId: (
    roomId: string,
    currentUserId?: string,
  ) => string | null;

  /**
   * Khởi tạo mốc tin nhắn đã đọc từ dữ liệu database khi tải danh sách phòng
   */
  initializeRoomReads: (
    rooms: Array<{
      id: string;
      members?: Array<{
        userId: string;
        lastReadMessageId?: string | null;
      }> | null;
    }>,
  ) => void;
}

export const useReadReceiptStore = create<ReadReceiptState>((set, get) => ({
  readByRoom: {},

  // Cập nhật mốc đọc tin nhắn của một thành viên
  setMemberLastRead: (roomId, userId, messageId) =>
    set((state) => {
      // Bỏ qua nếu thiếu bất kỳ thông tin cần thiết nào
      if (!roomId || !userId || !messageId) return state;

      // Sao chép map mốc đọc của các thành viên trong phòng { [userId]: messageId }
      const membersLastReadMap = { ...(state.readByRoom[roomId] || {}) };

      // Mốc ID tin nhắn đã đọc gần nhất của user này
      const currentLastReadMessageId = membersLastReadMap[userId];

      // Chỉ cập nhật nếu: user chưa có mốc đọc HOẶC tin nhắn mới có ID lớn hơn mốc cũ (chỉ tiến, không lùi)
      if (!currentLastReadMessageId || messageId > currentLastReadMessageId) {
        membersLastReadMap[userId] = messageId;
      }

      // Trả về state mới để trigger re-render cho các component đang theo dõi
      return {
        readByRoom: {
          ...state.readByRoom,
          [roomId]: membersLastReadMap,
        },
      };
    }),

  // Tìm mốc tin nhắn mới nhất mà người khác (loại trừ bản thân mình) đã đọc trong phòng
  getOtherMembersMaxReadMessageId: (roomId, currentUserId) => {
    const membersLastReadMap = get().readByRoom[roomId];
    if (!membersLastReadMap) return null;

    let maxId: string | null = null;
    for (const [userId, messageId] of Object.entries(membersLastReadMap)) {
      // Bỏ qua chính bản thân mình (chỉ kiểm tra mốc đọc của đối phương)
      if (currentUserId && userId === currentUserId) continue;

      // Tìm mốc messageId lớn nhất (tin nhắn mới nhất mà đối phương đã đọc)
      if (!maxId || messageId > maxId) {
        maxId = messageId;
      }
    }
    return maxId;
  },

  // Khởi tạo mốc tin nhắn đã đọc từ danh sách phòng lấy từ Database
  initializeRoomReads: (rooms) =>
    set((state) => {
      if (!rooms || rooms.length === 0) return state;

      const updatedReadByRoom = { ...state.readByRoom };
      let hasChange = false;

      for (const room of rooms) {
        if (!room?.id || !room.members?.length) continue;

        const currentRoomReads = { ...(updatedReadByRoom[room.id] || {}) };
        let roomChanged = false;

        for (const member of room.members) {
          if (!member.userId || !member.lastReadMessageId) continue;

          const currentRead = currentRoomReads[member.userId];
          if (!currentRead || member.lastReadMessageId > currentRead) {
            currentRoomReads[member.userId] = member.lastReadMessageId;
            roomChanged = true;
          }
        }

        if (roomChanged) {
          updatedReadByRoom[room.id] = currentRoomReads;
          hasChange = true;
        }
      }

      return hasChange ? { readByRoom: updatedReadByRoom } : state;
    }),
}));
