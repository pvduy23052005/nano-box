/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AddEmojiMessageInput = {
  emoji: string;
  messageId: string;
  userAvatar?: string | null | undefined;
  userName?: string | null | undefined;
};

export type CreateGroupRoomInput = {
  memberIds: Array<string>;
  title: string;
};

/** Trạng thái mối quan hệ bạn bè */
export type FriendshipStatus =
  | 'ACCEPTED'
  | 'CANCELLED'
  | 'PENDING'
  | 'REJECTED';

export type LoginInputDto = {
  email: string;
  password: string;
};

export type MemberRole =
  | 'ADMIN'
  | 'MEMBER'
  | 'SUPER_ADMIN';

export type MemberStatus =
  | 'ACCEPTED'
  | 'REFUSED'
  | 'WAITTING';

export type MessageInput = {
  content?: string | null | undefined;
  roomId: string;
  senderAvatar?: string | null | undefined;
  senderName?: string | null | undefined;
  tempKeys?: Array<string> | null | undefined;
};

export type NotificationType =
  | 'FRIEND_REQUEST'
  | 'NEW_MESSAGE'
  | 'NEW_ROOM'
  | 'REACTION';

export type RegisterInputDto = {
  confirmPassword: string;
  email: string;
  name: string;
  password: string;
};

export type RoomType =
  | 'GROUP'
  | 'SINGLE';

export type UpdateProfileInputDto = {
  avatar?: string | null | undefined;
  name?: string | null | undefined;
};

export type RegisterMutationVariables = Exact<{
  input: RegisterInputDto;
}>;


export type RegisterMutation = { register: { success: boolean, message: string, data: { id: string, name: string, email: string } | null } };

export type LoginMutationVariables = Exact<{
  input: LoginInputDto;
}>;


export type LoginMutation = { login: { success: boolean, message: string, data: { accessToken: string, user: { id: string, name: string, email: string } } | null } };

export type LoginGoogleMutationVariables = Exact<{
  idToken: string;
}>;


export type LoginGoogleMutation = { loginGoogle: { success: boolean, message: string, data: { accessToken: string, user: { id: string, name: string, email: string } } | null } };

export type GetMeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMeQuery = { getMe: { id: string, name: string, email: string, avatar: string } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout: boolean };

export type GetMessagesQueryVariables = Exact<{
  cursor?: string | null | undefined;
  limit?: number | null | undefined;
  roomId: string;
}>;


export type GetMessagesQuery = { getMessages: { hasMore: boolean, nextCursor: string | null, items: Array<{ id: string, content: string, senderId: string, senderAvatar: string | null, senderName: string | null, avatar: string | null, roomId: string, attachments: Array<string> | null, reactions: Array<{ emoji: string, userIds: Array<string> }> | null }> } };

export type SendMessageMutationVariables = Exact<{
  input: MessageInput;
}>;


export type SendMessageMutation = { sendMessage: { id: string, content: string, senderId: string, senderAvatar: string | null, senderName: string | null, avatar: string | null, roomId: string, attachments: Array<string> | null, reactions: Array<{ emoji: string, userIds: Array<string> }> | null } };

export type AddEmojiMessageMutationVariables = Exact<{
  input: AddEmojiMessageInput;
}>;


export type AddEmojiMessageMutation = { addEmojiMessage: { id: string, content: string, senderId: string, senderAvatar: string | null, senderName: string | null, avatar: string | null, roomId: string, attachments: Array<string> | null, reactions: Array<{ emoji: string, userIds: Array<string> }> | null } };

export type GetNotificationsQueryVariables = Exact<{
  cursor?: string | null | undefined;
  limit?: number | null | undefined;
}>;


export type GetNotificationsQuery = { getNotifications: { hasMore: boolean, nextCursor: string | null, unreadCount: number, items: Array<{ id: string, recipientId: string, senderId: string, senderName: string | null, senderAvatar: string | null, type: NotificationType, title: string, content: string, isRead: boolean, createdAt: unknown, metadata: { roomId: string | null, messageId: string | null } }> } };

export type GetUnreadNotificationCountQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUnreadNotificationCountQuery = { getUnreadNotificationCount: number };

export type MarkNotificationAsReadMutationVariables = Exact<{
  id: string;
}>;


export type MarkNotificationAsReadMutation = { markNotificationAsRead: boolean };

export type MarkAllNotificationsAsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsAsReadMutation = { markAllNotificationsAsRead: boolean };

export type GetRoomsByStatusQueryVariables = Exact<{
  status: MemberStatus;
  search?: string | null | undefined;
}>;


export type GetRoomsByStatusQuery = { getRoomsByStatus: Array<{ id: string, title: string | null, typeRoom: RoomType, avatar: string | null, groupAvatars: Array<string | null> | null, lastMessageId: { id: string | null, content: string | null, senderId: string | null, createdAt: unknown } | null, members: Array<{ userId: string, lastReadMessageId: string | null }> | null }> };

export type UpdateMemberLastReadMessageMutationVariables = Exact<{
  roomId: string;
  messageId: string;
}>;


export type UpdateMemberLastReadMessageMutation = { updateMemberLastReadMessage: boolean };

export type CreateGroupRoomMutationVariables = Exact<{
  input: CreateGroupRoomInput;
}>;


export type CreateGroupRoomMutation = { createGroupRoom: { id: string, title: string | null, typeRoom: RoomType, avatar: string | null, groupAvatars: Array<string | null> | null, lastMessageId: { id: string | null, content: string | null, senderId: string | null, createdAt: unknown } | null, members: Array<{ userId: string, role: MemberRole, status: MemberStatus, lastReadMessageId: string | null }> | null } };

export type GetUsersQueryVariables = Exact<{
  search?: string | null | undefined;
}>;


export type GetUsersQuery = { getUsers: Array<{ id: string, name: string, email: string, avatar: string }> };

export type CreateRoomChatNotFriendMutationVariables = Exact<{
  otherUserId: string;
}>;


export type CreateRoomChatNotFriendMutation = { createRoomChatNotFriend: { id: string, title: string | null, typeRoom: RoomType, avatar: string | null, lastMessageId: { id: string | null, content: string | null, senderId: string | null, createdAt: unknown } | null, members: Array<{ userId: string, role: MemberRole, status: MemberStatus }> | null } };

export type UpdateProfileMutationVariables = Exact<{
  input: UpdateProfileInputDto;
}>;


export type UpdateProfileMutation = { updateProfile: { success: boolean, message: string, data: { id: string, name: string, email: string, avatar: string } | null } };

export type SendFriendRequestMutationVariables = Exact<{
  addresseeId: string;
}>;


export type SendFriendRequestMutation = { sendFriendRequest: { success: boolean, message: string, data: { id: string, requesterId: string, addresseeId: string, status: FriendshipStatus, createdAt: unknown, updatedAt: unknown } | null } };

export type GetReceivedFriendRequestsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetReceivedFriendRequestsQuery = { getReceivedFriendRequests: Array<{ id: string, createdAt: unknown, sender: { id: string, name: string, email: string, avatar: string | null } }> };

export type AcceptFriendRequestMutationVariables = Exact<{
  friendId: string;
}>;


export type AcceptFriendRequestMutation = { acceptFriendRequest: { success: boolean, message: string, data: { id: string, requesterId: string, addresseeId: string, status: FriendshipStatus } | null } };

export type RejectFriendRequestMutationVariables = Exact<{
  friendId: string;
}>;


export type RejectFriendRequestMutation = { rejectFriendRequest: { success: boolean, message: string, data: { id: string, requesterId: string, addresseeId: string, status: FriendshipStatus } | null } };

export type CancelFriendRequestMutationVariables = Exact<{
  friendId: string;
}>;


export type CancelFriendRequestMutation = { cancelFriendRequest: { success: boolean, message: string, data: { id: string, requesterId: string, addresseeId: string, status: FriendshipStatus } | null } };

export type GetFriendsQueryVariables = Exact<{
  search?: string | null | undefined;
}>;


export type GetFriendsQuery = { getFriends: Array<{ id: string, name: string, email: string, avatar: string }> };


export const RegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Register"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterInputDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"register"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInputDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const LoginGoogleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LoginGoogle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idToken"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loginGoogle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"idToken"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idToken"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]}}]} as unknown as DocumentNode<LoginGoogleMutation, LoginGoogleMutationVariables>;
export const GetMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}}]}}]} as unknown as DocumentNode<GetMeQuery, GetMeQueryVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const GetMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMessages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getMessages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cursor"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cursor"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"roomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"senderId"}},{"kind":"Field","name":{"kind":"Name","value":"senderAvatar"}},{"kind":"Field","name":{"kind":"Name","value":"senderName"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"roomId"}},{"kind":"Field","name":{"kind":"Name","value":"attachments"}},{"kind":"Field","name":{"kind":"Name","value":"reactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emoji"}},{"kind":"Field","name":{"kind":"Name","value":"userIds"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasMore"}},{"kind":"Field","name":{"kind":"Name","value":"nextCursor"}}]}}]}}]} as unknown as DocumentNode<GetMessagesQuery, GetMessagesQueryVariables>;
export const SendMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MessageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"senderId"}},{"kind":"Field","name":{"kind":"Name","value":"senderAvatar"}},{"kind":"Field","name":{"kind":"Name","value":"senderName"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"roomId"}},{"kind":"Field","name":{"kind":"Name","value":"attachments"}},{"kind":"Field","name":{"kind":"Name","value":"reactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emoji"}},{"kind":"Field","name":{"kind":"Name","value":"userIds"}}]}}]}}]}}]} as unknown as DocumentNode<SendMessageMutation, SendMessageMutationVariables>;
export const AddEmojiMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddEmojiMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddEmojiMessageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addEmojiMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"senderId"}},{"kind":"Field","name":{"kind":"Name","value":"senderAvatar"}},{"kind":"Field","name":{"kind":"Name","value":"senderName"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"roomId"}},{"kind":"Field","name":{"kind":"Name","value":"attachments"}},{"kind":"Field","name":{"kind":"Name","value":"reactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emoji"}},{"kind":"Field","name":{"kind":"Name","value":"userIds"}}]}}]}}]}}]} as unknown as DocumentNode<AddEmojiMessageMutation, AddEmojiMessageMutationVariables>;
export const GetNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cursor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getNotifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cursor"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cursor"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"recipientId"}},{"kind":"Field","name":{"kind":"Name","value":"senderId"}},{"kind":"Field","name":{"kind":"Name","value":"senderName"}},{"kind":"Field","name":{"kind":"Name","value":"senderAvatar"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"roomId"}},{"kind":"Field","name":{"kind":"Name","value":"messageId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasMore"}},{"kind":"Field","name":{"kind":"Name","value":"nextCursor"}},{"kind":"Field","name":{"kind":"Name","value":"unreadCount"}}]}}]}}]} as unknown as DocumentNode<GetNotificationsQuery, GetNotificationsQueryVariables>;
export const GetUnreadNotificationCountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUnreadNotificationCount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUnreadNotificationCount"}}]}}]} as unknown as DocumentNode<GetUnreadNotificationCountQuery, GetUnreadNotificationCountQueryVariables>;
export const MarkNotificationAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkNotificationAsRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markNotificationAsRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<MarkNotificationAsReadMutation, MarkNotificationAsReadMutationVariables>;
export const MarkAllNotificationsAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllNotificationsAsRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllNotificationsAsRead"}}]}}]} as unknown as DocumentNode<MarkAllNotificationsAsReadMutation, MarkAllNotificationsAsReadMutationVariables>;
export const GetRoomsByStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRoomsByStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MemberStatus"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getRoomsByStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"typeRoom"}},{"kind":"Field","name":{"kind":"Name","value":"lastMessageId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"senderId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"groupAvatars"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"lastReadMessageId"}}]}}]}}]}}]} as unknown as DocumentNode<GetRoomsByStatusQuery, GetRoomsByStatusQueryVariables>;
export const UpdateMemberLastReadMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMemberLastReadMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"messageId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMemberLastReadMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}}},{"kind":"Argument","name":{"kind":"Name","value":"messageId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"messageId"}}}]}]}}]} as unknown as DocumentNode<UpdateMemberLastReadMessageMutation, UpdateMemberLastReadMessageMutationVariables>;
export const CreateGroupRoomDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateGroupRoom"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateGroupRoomInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createGroupRoom"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"typeRoom"}},{"kind":"Field","name":{"kind":"Name","value":"lastMessageId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"senderId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"groupAvatars"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lastReadMessageId"}}]}}]}}]}}]} as unknown as DocumentNode<CreateGroupRoomMutation, CreateGroupRoomMutationVariables>;
export const GetUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUsers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}}]}}]} as unknown as DocumentNode<GetUsersQuery, GetUsersQueryVariables>;
export const CreateRoomChatNotFriendDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRoomChatNotFriend"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"otherUserId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRoomChatNotFriend"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"otherUserId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"otherUserId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"typeRoom"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"lastMessageId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"senderId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<CreateRoomChatNotFriendMutation, CreateRoomChatNotFriendMutationVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProfileInputDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const SendFriendRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendFriendRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"addresseeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendFriendRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"addresseeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"addresseeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requesterId"}},{"kind":"Field","name":{"kind":"Name","value":"addresseeId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]}}]} as unknown as DocumentNode<SendFriendRequestMutation, SendFriendRequestMutationVariables>;
export const GetReceivedFriendRequestsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetReceivedFriendRequests"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getReceivedFriendRequests"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"sender"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}}]}}]}}]} as unknown as DocumentNode<GetReceivedFriendRequestsQuery, GetReceivedFriendRequestsQueryVariables>;
export const AcceptFriendRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcceptFriendRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"friendId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"acceptFriendRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"friendId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"friendId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requesterId"}},{"kind":"Field","name":{"kind":"Name","value":"addresseeId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<AcceptFriendRequestMutation, AcceptFriendRequestMutationVariables>;
export const RejectFriendRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RejectFriendRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"friendId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rejectFriendRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"friendId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"friendId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requesterId"}},{"kind":"Field","name":{"kind":"Name","value":"addresseeId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<RejectFriendRequestMutation, RejectFriendRequestMutationVariables>;
export const CancelFriendRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelFriendRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"friendId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelFriendRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"friendId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"friendId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requesterId"}},{"kind":"Field","name":{"kind":"Name","value":"addresseeId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<CancelFriendRequestMutation, CancelFriendRequestMutationVariables>;
export const GetFriendsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFriends"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getFriends"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}}]}}]} as unknown as DocumentNode<GetFriendsQuery, GetFriendsQueryVariables>;