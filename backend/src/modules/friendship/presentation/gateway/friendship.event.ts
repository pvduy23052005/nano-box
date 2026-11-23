export const FRIENDSHIP_SOCKET_EVENTS = {
  FRIEND_REQUEST: 'friend.request',
  FRIEND_REQUEST_ACCEPTED: 'friend.request.accepted',
  FRIEND_REQUEST_CANCELLED: 'friend.request.cancelled',
  FRIEND_REQUEST_REJECTED: 'friend.request.rejected',
  FRIEND_REQUEST_REMOVED: 'friend.request.removed',
};

export const FRIENDSHIP_INTERNAL_EVENTS = {
  FRIEND_REQUEST_ACCEPTED: 'friendship.request.accepted',
  FRIEND_REQUEST_CANCELLED: 'friendship.request.cancelled',
  FRIEND_REQUEST_REJECTED: 'friendship.request.rejected',
};

export interface FriendshipActionPayload {
  friendshipId: string;
  actorId: string;
  targetId: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}
