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
    }
  }
`);
