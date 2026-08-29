import { graphql } from "../../../types/graphql";

export const GET_USERS_QUERY = graphql(`
  query GetUsers($search: String) {
    getUsers(search: $search) {
      id
      name
      email
      avatar
    }
  }
`);
