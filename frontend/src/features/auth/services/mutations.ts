import { graphql } from "@/src/types/graphql";

export const REGISTER_MUTATION = graphql(`
  mutation Register($input: RegisterInputDto!) {
    register(input: $input) {
      success
      message
      data {
        id
        name
        email
      }
    }
  }
`);
