import { graphql } from "../../../types/graphql";

export const GET_USERS_QUERY = graphql(`
  query GetUsers($search: String) {
    getUsers(search: $search) {
      id
      name
      email
      avatar
    }
  }
`);

export const CREATE_ROOM_CHAT_NOT_FRIEND_MUTATION = graphql(`
  mutation CreateRoomChatNotFriend($otherUserId: String!) {
    createRoomChatNotFriend(otherUserId: $otherUserId) {
      id
      title
      typeRoom
      avatar
      lastMessageId
      members {
        userId
        role
        status
      }
    }
  }
`);

