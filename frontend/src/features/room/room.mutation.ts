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

export const ADD_MEMBER_TO_ROOM_MUTATION = graphql(`
  mutation AddMemberToRoom($input: AddMemberToRoomInput!) {
    addMemberToRoom(input: $input) {
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

export const REMOVE_MEMBER_FROM_ROOM_MUTATION = graphql(`
  mutation RemoveMemberFromRoom($input: RemoveMemberFromRoomInput!) {
    removeMemberFromRoom(input: $input) {
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

export const ASSIGN_ROOM_ADMIN_MUTATION = graphql(`
  mutation AssignRoomAdmin($input: AssignRoomAdminInput!) {
    assignRoomAdmin(input: $input) {
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

export const REVOKE_ROOM_ADMIN_MUTATION = graphql(`
  mutation RevokeRoomAdmin($input: RevokeRoomAdminInput!) {
    revokeRoomAdmin(input: $input) {
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

export const UPDATE_ROOM_PROFILE_MUTATION = graphql(`
  mutation UpdateRoomProfile($input: UpdateRoomProfileInput!) {
    updateRoomProfile(input: $input) {
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

export const LEAVE_ROOM_MUTATION = graphql(`
  mutation LeaveRoom($roomId: String!) {
    leaveRoom(roomId: $roomId)
  }
`);

