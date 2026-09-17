import { graphql } from "@/src/types/graphql";

export const GET_ROOMS_BY_STATUS_QUERY = graphql(`
  query GetRoomsByStatus($status: MemberStatus!) {
    getRoomsByStatus(status: $status) {
      id
      title
      typeRoom
      lastMessageId{
        id
        content
        senderId
        createdAt
      }
      avatar
      members {
        userId
        lastReadMessageId
      }
    }
  }
`);

export const UPDATE_MEMBER_LAST_READ_MESSAGE_MUTATION = graphql(`
  mutation UpdateMemberLastReadMessage($roomId: String!, $messageId: String!) {
    updateMemberLastReadMessage(roomId: $roomId, messageId: $messageId)
  }
`);
