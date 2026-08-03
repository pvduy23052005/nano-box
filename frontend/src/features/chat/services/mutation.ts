import { graphql } from "@/src/types/graphql";

export const GET_MESSAGE_QUERY = graphql(`
  query GetMessages {
    getMessages {
      id
      content
      senderId
      attachments
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