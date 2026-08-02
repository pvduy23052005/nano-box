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