import { HttpLink } from "@apollo/client";

export const createHttpLink = (token?: string | null) => {
  return new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:5050/graphql",
    credentials: "include",
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    },
  });
};