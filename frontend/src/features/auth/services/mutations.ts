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

export const LOGIN_MUTATION = graphql(`
  mutation Login($input: LoginInputDto!) {
    login(input: $input) {
      success
      message
      data {
        accessToken
        user {
          id
          name
          email
        }
      }
    }
  }
`);

export const LOGIN_GOOGLE_MUTATION = graphql(`
  mutation LoginGoogle($idToken: String!) {
    loginGoogle(idToken: $idToken) {
      success
      message
      data {
        accessToken
        user {
          id
          name
          email
        }
      }
    }
  }
`);

export const GET_ME_QUERY = graphql(`
  query GetMe {
    getMe {
      id
      name
      email
    }
  }
`);