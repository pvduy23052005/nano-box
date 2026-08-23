import { graphql } from "@/src/types/graphql";

export const GET_MESSAGE_QUERY = graphql(`
  query GetMessages($cursor: String, $limit: Float) {
    getMessages(cursor: $cursor, limit: $limit) {
      items {
        id
        content
        senderId
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
      attachments
    }
  }
`);
