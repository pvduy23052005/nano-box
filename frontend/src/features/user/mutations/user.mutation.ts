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
      groupAvatars
      lastMessageId {
        id
        content
        senderId
        createdAt
        mentionedUserIds
      }
      members {
        userId
        role
        status
        lastReadMessageId
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

export const GET_RECEIVED_FRIEND_REQUESTS_QUERY = graphql(`
  query GetReceivedFriendRequests {
    getReceivedFriendRequests {
      id
      createdAt
      sender {
        id
        name
        email
        avatar
      }
    }
  }
`);

export const ACCEPT_FRIEND_REQUEST_MUTATION = graphql(`
  mutation AcceptFriendRequest($friendId: String!) {
    acceptFriendRequest(friendId: $friendId) {
      success
      message
      data {
        id
        requesterId
        addresseeId
        status
      }
    }
  }
`);

export const REJECT_FRIEND_REQUEST_MUTATION = graphql(`
  mutation RejectFriendRequest($friendId: String!) {
    rejectFriendRequest(friendId: $friendId) {
      success
      message
      data {
        id
        requesterId
        addresseeId
        status
      }
    }
  }
`);

export const CANCEL_FRIEND_REQUEST_MUTATION = graphql(`
  mutation CancelFriendRequest($friendId: String!) {
    cancelFriendRequest(friendId: $friendId) {
      success
      message
      data {
        id
        requesterId
        addresseeId
        status
      }
    }
  }
`);

export const GET_FRIENDS_QUERY = graphql(`
  query GetFriends($search: String) {
    getFriends(search: $search) {
      id
      name
      email
      avatar
    }
  }
`);



