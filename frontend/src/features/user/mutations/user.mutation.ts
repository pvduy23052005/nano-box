import { graphql } from "../../../types/graphql";

export const GET_USERS_QUERY = graphql(`
  query GetUsers {
    getUsers {
      id
      name
      email
      avatar
    }
  }
`);
