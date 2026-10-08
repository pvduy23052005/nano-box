import { RoomMemberProps, RoomProps } from '../../domain/room.type';
import { RoomOutput } from '../dto/room.output';

export const ROOM_EVENTS = {
  MEMBER_ADDED: 'room.member_added',
  MEMBER_REMOVED: 'room.member_removed',
  ADMIN_ASSIGNED: 'room.admin_assigned',
  ADMIN_REVOKED: 'room.admin_revoked',
} as const;

export const ROOM_MEMBER_ACTIONS = {
  MEMBER_ADDED: 'MEMBER_ADDED',
  MEMBER_REMOVED: 'MEMBER_REMOVED',
  ADMIN_ASSIGNED: 'ADMIN_ASSIGNED',
  ADMIN_REVOKED: 'ADMIN_REVOKED',
} as const;

export type RoomMemberAction =
  (typeof ROOM_MEMBER_ACTIONS)[keyof typeof ROOM_MEMBER_ACTIONS];

export interface RoomMemberAddedPayload {
  room: RoomProps;
  roomOutput: RoomOutput;
  adderId: string;
  addedUserId: string;
}

export interface RoomMemberRemovedPayload {
  room: RoomProps;
  roomOutput: RoomOutput;
  actorId: string;
  removedUserId: string;
  removedMember?: RoomMemberProps;
}

export interface RoomAdminAssignedPayload {
  room: RoomProps;
  roomOutput: RoomOutput;
  actorId: string;
  targetUserId: string;
}

export interface RoomAdminRevokedPayload {
  room: RoomProps;
  roomOutput: RoomOutput;
  actorId: string;
  targetUserId: string;
}
