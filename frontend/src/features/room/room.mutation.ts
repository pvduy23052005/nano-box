import { graphql } from "@/src/types/graphql";

export const GET_ROOMS_BY_STATUS_QUERY = graphql(`
  query GetRoomsByStatus($status: MemberStatus!, $search: String) {
    getRoomsByStatus(status: $status, search: $search) {
      id
      title
      typeRoom
      lastMessageId {
        id
        content
        senderId
        createdAt
      }
      avatar
      groupAvatars
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

export const CREATE_GROUP_ROOM_MUTATION = graphql(`
  mutation CreateGroupRoom($input: CreateGroupRoomInput!) {
    createGroupRoom(input: $input) {
      id
      title
      typeRoom
      lastMessageId {
        id
        content
        senderId
        createdAt
      }
      avatar
      groupAvatars
      members {
        userId
        role
        status
        lastReadMessageId
      }
    }
  }
`);

export const GET_ROOM_DETAIL_QUERY = graphql(`
  query GetRoomDetail($roomId: String!) {
    getRoomDetail(roomId: $roomId) {
      id
      title
      typeRoom
      avatar
      groupAvatars
      members {
        role
        user {
          id
          name
          avatar
        }
      }
    }
  }
`);
