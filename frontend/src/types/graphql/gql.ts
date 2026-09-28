/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation Register($input: RegisterInputDto!) {\n    register(input: $input) {\n      success\n      message\n      data {\n        id\n        name\n        email\n      }\n    }\n  }\n": typeof types.RegisterDocument,
    "\n  mutation Login($input: LoginInputDto!) {\n    login(input: $input) {\n      success\n      message\n      data {\n        accessToken\n        user {\n          id\n          name\n          email\n        }\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation LoginGoogle($idToken: String!) {\n    loginGoogle(idToken: $idToken) {\n      success\n      message\n      data {\n        accessToken\n        user {\n          id\n          name\n          email\n        }\n      }\n    }\n  }\n": typeof types.LoginGoogleDocument,
    "\n  query GetMe {\n    getMe {\n      id\n      name\n      email\n      avatar\n    }\n  }\n": typeof types.GetMeDocument,
    "\n  mutation Logout {\n    logout\n  }\n": typeof types.LogoutDocument,
    "\n  query GetMessages($cursor: String, $limit: Float, $roomId: String!) {\n    getMessages(cursor: $cursor, limit: $limit, roomId: $roomId) {\n      items {\n        id\n        content\n        senderId\n        roomId\n        attachments\n        reactions {\n          emoji\n          userIds\n        }\n      }\n      hasMore\n      nextCursor\n    }\n  }\n": typeof types.GetMessagesDocument,
    "\n  mutation SendMessage($input: MessageInput!) {\n    sendMessage(input: $input) {\n      id  \n      content\n      senderId\n      roomId\n      attachments\n      reactions {\n        emoji\n        userIds\n      }\n    }\n  }\n": typeof types.SendMessageDocument,
    "\n  mutation AddEmojiMessage($input: AddEmojiMessageInput!) {\n    addEmojiMessage(input: $input) {\n      id\n      content\n      senderId\n      roomId\n      attachments\n      reactions {\n        emoji\n        userIds\n      }\n    }\n  }\n": typeof types.AddEmojiMessageDocument,
    "\n  query GetNotifications($cursor: String, $limit: Float) {\n    getNotifications(cursor: $cursor, limit: $limit) {\n      items {\n        id\n        recipientId\n        senderId\n        senderName\n        senderAvatar\n        type\n        title\n        content\n        metadata {\n          roomId\n          messageId\n        }\n        isRead\n        createdAt\n      }\n      hasMore\n      nextCursor\n      unreadCount\n    }\n  }\n": typeof types.GetNotificationsDocument,
    "\n  query GetUnreadNotificationCount {\n    getUnreadNotificationCount\n  }\n": typeof types.GetUnreadNotificationCountDocument,
    "\n  mutation MarkNotificationAsRead($id: String!) {\n    markNotificationAsRead(id: $id)\n  }\n": typeof types.MarkNotificationAsReadDocument,
    "\n  mutation MarkAllNotificationsAsRead {\n    markAllNotificationsAsRead\n  }\n": typeof types.MarkAllNotificationsAsReadDocument,
    "\n  query GetRoomsByStatus($status: MemberStatus!) {\n    getRoomsByStatus(status: $status) {\n      id\n      title\n      typeRoom\n      lastMessageId{\n        id\n        content\n        senderId\n        createdAt\n      }\n      avatar\n      members {\n        userId\n        lastReadMessageId\n      }\n    }\n  }\n": typeof types.GetRoomsByStatusDocument,
    "\n  mutation UpdateMemberLastReadMessage($roomId: String!, $messageId: String!) {\n    updateMemberLastReadMessage(roomId: $roomId, messageId: $messageId)\n  }\n": typeof types.UpdateMemberLastReadMessageDocument,
    "\n  query GetUsers($search: String) {\n    getUsers(search: $search) {\n      id\n      name\n      email\n      avatar\n    }\n  }\n": typeof types.GetUsersDocument,
    "\n  mutation CreateRoomChatNotFriend($otherUserId: String!) {\n    createRoomChatNotFriend(otherUserId: $otherUserId) {\n      id\n      title\n      typeRoom\n      avatar\n      lastMessageId {\n        id\n        content\n        senderId\n        createdAt\n      }\n      members {\n        userId\n        role\n        status\n      }\n    }\n  }\n": typeof types.CreateRoomChatNotFriendDocument,
    "\n  mutation UpdateProfile($input: UpdateProfileInputDto!) {\n    updateProfile(input: $input) {\n      success\n      message\n      data {\n        id\n        name\n        email\n        avatar\n      }\n    }\n  }\n": typeof types.UpdateProfileDocument,
};
const documents: Documents = {
    "\n  mutation Register($input: RegisterInputDto!) {\n    register(input: $input) {\n      success\n      message\n      data {\n        id\n        name\n        email\n      }\n    }\n  }\n": types.RegisterDocument,
    "\n  mutation Login($input: LoginInputDto!) {\n    login(input: $input) {\n      success\n      message\n      data {\n        accessToken\n        user {\n          id\n          name\n          email\n        }\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation LoginGoogle($idToken: String!) {\n    loginGoogle(idToken: $idToken) {\n      success\n      message\n      data {\n        accessToken\n        user {\n          id\n          name\n          email\n        }\n      }\n    }\n  }\n": types.LoginGoogleDocument,
    "\n  query GetMe {\n    getMe {\n      id\n      name\n      email\n      avatar\n    }\n  }\n": types.GetMeDocument,
    "\n  mutation Logout {\n    logout\n  }\n": types.LogoutDocument,
    "\n  query GetMessages($cursor: String, $limit: Float, $roomId: String!) {\n    getMessages(cursor: $cursor, limit: $limit, roomId: $roomId) {\n      items {\n        id\n        content\n        senderId\n        roomId\n        attachments\n        reactions {\n          emoji\n          userIds\n        }\n      }\n      hasMore\n      nextCursor\n    }\n  }\n": types.GetMessagesDocument,
    "\n  mutation SendMessage($input: MessageInput!) {\n    sendMessage(input: $input) {\n      id  \n      content\n      senderId\n      roomId\n      attachments\n      reactions {\n        emoji\n        userIds\n      }\n    }\n  }\n": types.SendMessageDocument,
    "\n  mutation AddEmojiMessage($input: AddEmojiMessageInput!) {\n    addEmojiMessage(input: $input) {\n      id\n      content\n      senderId\n      roomId\n      attachments\n      reactions {\n        emoji\n        userIds\n      }\n    }\n  }\n": types.AddEmojiMessageDocument,
    "\n  query GetNotifications($cursor: String, $limit: Float) {\n    getNotifications(cursor: $cursor, limit: $limit) {\n      items {\n        id\n        recipientId\n        senderId\n        senderName\n        senderAvatar\n        type\n        title\n        content\n        metadata {\n          roomId\n          messageId\n        }\n        isRead\n        createdAt\n      }\n      hasMore\n      nextCursor\n      unreadCount\n    }\n  }\n": types.GetNotificationsDocument,
    "\n  query GetUnreadNotificationCount {\n    getUnreadNotificationCount\n  }\n": types.GetUnreadNotificationCountDocument,
    "\n  mutation MarkNotificationAsRead($id: String!) {\n    markNotificationAsRead(id: $id)\n  }\n": types.MarkNotificationAsReadDocument,
    "\n  mutation MarkAllNotificationsAsRead {\n    markAllNotificationsAsRead\n  }\n": types.MarkAllNotificationsAsReadDocument,
    "\n  query GetRoomsByStatus($status: MemberStatus!) {\n    getRoomsByStatus(status: $status) {\n      id\n      title\n      typeRoom\n      lastMessageId{\n        id\n        content\n        senderId\n        createdAt\n      }\n      avatar\n      members {\n        userId\n        lastReadMessageId\n      }\n    }\n  }\n": types.GetRoomsByStatusDocument,
    "\n  mutation UpdateMemberLastReadMessage($roomId: String!, $messageId: String!) {\n    updateMemberLastReadMessage(roomId: $roomId, messageId: $messageId)\n  }\n": types.UpdateMemberLastReadMessageDocument,
    "\n  query GetUsers($search: String) {\n    getUsers(search: $search) {\n      id\n      name\n      email\n      avatar\n    }\n  }\n": types.GetUsersDocument,
    "\n  mutation CreateRoomChatNotFriend($otherUserId: String!) {\n    createRoomChatNotFriend(otherUserId: $otherUserId) {\n      id\n      title\n      typeRoom\n      avatar\n      lastMessageId {\n        id\n        content\n        senderId\n        createdAt\n      }\n      members {\n        userId\n        role\n        status\n      }\n    }\n  }\n": types.CreateRoomChatNotFriendDocument,
    "\n  mutation UpdateProfile($input: UpdateProfileInputDto!) {\n    updateProfile(input: $input) {\n      success\n      message\n      data {\n        id\n        name\n        email\n        avatar\n      }\n    }\n  }\n": types.UpdateProfileDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Register($input: RegisterInputDto!) {\n    register(input: $input) {\n      success\n      message\n      data {\n        id\n        name\n        email\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Register($input: RegisterInputDto!) {\n    register(input: $input) {\n      success\n      message\n      data {\n        id\n        name\n        email\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($input: LoginInputDto!) {\n    login(input: $input) {\n      success\n      message\n      data {\n        accessToken\n        user {\n          id\n          name\n          email\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Login($input: LoginInputDto!) {\n    login(input: $input) {\n      success\n      message\n      data {\n        accessToken\n        user {\n          id\n          name\n          email\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation LoginGoogle($idToken: String!) {\n    loginGoogle(idToken: $idToken) {\n      success\n      message\n      data {\n        accessToken\n        user {\n          id\n          name\n          email\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation LoginGoogle($idToken: String!) {\n    loginGoogle(idToken: $idToken) {\n      success\n      message\n      data {\n        accessToken\n        user {\n          id\n          name\n          email\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMe {\n    getMe {\n      id\n      name\n      email\n      avatar\n    }\n  }\n"): (typeof documents)["\n  query GetMe {\n    getMe {\n      id\n      name\n      email\n      avatar\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Logout {\n    logout\n  }\n"): (typeof documents)["\n  mutation Logout {\n    logout\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMessages($cursor: String, $limit: Float, $roomId: String!) {\n    getMessages(cursor: $cursor, limit: $limit, roomId: $roomId) {\n      items {\n        id\n        content\n        senderId\n        roomId\n        attachments\n        reactions {\n          emoji\n          userIds\n        }\n      }\n      hasMore\n      nextCursor\n    }\n  }\n"): (typeof documents)["\n  query GetMessages($cursor: String, $limit: Float, $roomId: String!) {\n    getMessages(cursor: $cursor, limit: $limit, roomId: $roomId) {\n      items {\n        id\n        content\n        senderId\n        roomId\n        attachments\n        reactions {\n          emoji\n          userIds\n        }\n      }\n      hasMore\n      nextCursor\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SendMessage($input: MessageInput!) {\n    sendMessage(input: $input) {\n      id  \n      content\n      senderId\n      roomId\n      attachments\n      reactions {\n        emoji\n        userIds\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SendMessage($input: MessageInput!) {\n    sendMessage(input: $input) {\n      id  \n      content\n      senderId\n      roomId\n      attachments\n      reactions {\n        emoji\n        userIds\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddEmojiMessage($input: AddEmojiMessageInput!) {\n    addEmojiMessage(input: $input) {\n      id\n      content\n      senderId\n      roomId\n      attachments\n      reactions {\n        emoji\n        userIds\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AddEmojiMessage($input: AddEmojiMessageInput!) {\n    addEmojiMessage(input: $input) {\n      id\n      content\n      senderId\n      roomId\n      attachments\n      reactions {\n        emoji\n        userIds\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetNotifications($cursor: String, $limit: Float) {\n    getNotifications(cursor: $cursor, limit: $limit) {\n      items {\n        id\n        recipientId\n        senderId\n        senderName\n        senderAvatar\n        type\n        title\n        content\n        metadata {\n          roomId\n          messageId\n        }\n        isRead\n        createdAt\n      }\n      hasMore\n      nextCursor\n      unreadCount\n    }\n  }\n"): (typeof documents)["\n  query GetNotifications($cursor: String, $limit: Float) {\n    getNotifications(cursor: $cursor, limit: $limit) {\n      items {\n        id\n        recipientId\n        senderId\n        senderName\n        senderAvatar\n        type\n        title\n        content\n        metadata {\n          roomId\n          messageId\n        }\n        isRead\n        createdAt\n      }\n      hasMore\n      nextCursor\n      unreadCount\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUnreadNotificationCount {\n    getUnreadNotificationCount\n  }\n"): (typeof documents)["\n  query GetUnreadNotificationCount {\n    getUnreadNotificationCount\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkNotificationAsRead($id: String!) {\n    markNotificationAsRead(id: $id)\n  }\n"): (typeof documents)["\n  mutation MarkNotificationAsRead($id: String!) {\n    markNotificationAsRead(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkAllNotificationsAsRead {\n    markAllNotificationsAsRead\n  }\n"): (typeof documents)["\n  mutation MarkAllNotificationsAsRead {\n    markAllNotificationsAsRead\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetRoomsByStatus($status: MemberStatus!) {\n    getRoomsByStatus(status: $status) {\n      id\n      title\n      typeRoom\n      lastMessageId{\n        id\n        content\n        senderId\n        createdAt\n      }\n      avatar\n      members {\n        userId\n        lastReadMessageId\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetRoomsByStatus($status: MemberStatus!) {\n    getRoomsByStatus(status: $status) {\n      id\n      title\n      typeRoom\n      lastMessageId{\n        id\n        content\n        senderId\n        createdAt\n      }\n      avatar\n      members {\n        userId\n        lastReadMessageId\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateMemberLastReadMessage($roomId: String!, $messageId: String!) {\n    updateMemberLastReadMessage(roomId: $roomId, messageId: $messageId)\n  }\n"): (typeof documents)["\n  mutation UpdateMemberLastReadMessage($roomId: String!, $messageId: String!) {\n    updateMemberLastReadMessage(roomId: $roomId, messageId: $messageId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUsers($search: String) {\n    getUsers(search: $search) {\n      id\n      name\n      email\n      avatar\n    }\n  }\n"): (typeof documents)["\n  query GetUsers($search: String) {\n    getUsers(search: $search) {\n      id\n      name\n      email\n      avatar\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateRoomChatNotFriend($otherUserId: String!) {\n    createRoomChatNotFriend(otherUserId: $otherUserId) {\n      id\n      title\n      typeRoom\n      avatar\n      lastMessageId {\n        id\n        content\n        senderId\n        createdAt\n      }\n      members {\n        userId\n        role\n        status\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateRoomChatNotFriend($otherUserId: String!) {\n    createRoomChatNotFriend(otherUserId: $otherUserId) {\n      id\n      title\n      typeRoom\n      avatar\n      lastMessageId {\n        id\n        content\n        senderId\n        createdAt\n      }\n      members {\n        userId\n        role\n        status\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateProfile($input: UpdateProfileInputDto!) {\n    updateProfile(input: $input) {\n      success\n      message\n      data {\n        id\n        name\n        email\n        avatar\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateProfile($input: UpdateProfileInputDto!) {\n    updateProfile(input: $input) {\n      success\n      message\n      data {\n        id\n        name\n        email\n        avatar\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;