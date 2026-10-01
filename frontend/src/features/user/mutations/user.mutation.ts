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
      lastMessageId {
        id
        content
        senderId
        createdAt
      }
      members {
        userId
        role
        status
      }
    }
  }
`);

export const UPDATE_PROFILE_MUTATION = graphql(`
  mutation UpdateProfile($input: UpdateProfileInputDto!) {
    updateProfile(input: $input) {
      success
      message
      data {
        id
        name
        email
        avatar
      }
    }
  }
`);

export const SEND_FRIEND_REQUEST_MUTATION = graphql(`
  mutation SendFriendRequest($addresseeId: String!) {
    sendFriendRequest(addresseeId: $addresseeId) {
      success
      message
      data {
        id
        requesterId
        addresseeId
        status
        createdAt
        updatedAt
      }
    }
  }
`);

