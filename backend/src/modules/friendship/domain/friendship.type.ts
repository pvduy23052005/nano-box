export enum FriendshipStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface FriendshipProps {
  id?: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FriendSender {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ReceivedFriendRequestProps {
  id: string;
  sender: FriendSender;
  createdAt?: Date;
}
