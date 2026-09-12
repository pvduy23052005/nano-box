import { graphql } from "@/src/types/graphql";

export const GET_MESSAGE_QUERY = graphql(`
  query GetMessages($cursor: String, $limit: Float, $roomId: String!) {
    getMessages(cursor: $cursor, limit: $limit, roomId: $roomId) {
      items {
        id
        content
        senderId
        roomId
        attachments
      }
      hasMore
      nextCursor
    }
  }
`);

export const SEND_MESSAGE_MUTATION = graphql(`
  mutation SendMessage($input: MessageInput!) {
    sendMessage(input: $input) {
      id  
      content
      senderId
      roomId
      attachments
    }
  }
`);
