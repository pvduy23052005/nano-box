import { HttpLink, InMemoryCacheConfig } from "@apollo/client";

export const createHttpLink = (token?: string | null) => {
  let uri =
    process.env.NEXT_PUBLIC_GRAPHQL_API_URL ||
    process.env.NEXT_PUBLIC_GRAPHQL_URI;

  if (!uri) {
    if (typeof window !== "undefined") {
      if (
        process.env.NODE_ENV !== "production" &&
        window.location.port === "3000"
      ) {
        uri = "http://localhost:5050/graphql";
      } else {
        uri = "/graphql";
      }
    } else {
      if (process.env.NODE_ENV !== "production") {
        uri =
          process.env.INTERNAL_GRAPHQL_API_URL ||
          "http://localhost:5050/graphql";
      } else {
        uri =
          process.env.INTERNAL_GRAPHQL_API_URL ||
          "http://nano-box-backend:5050/graphql";
      }
    }
  }

  return new HttpLink({
    uri,
    credentials: "include",
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    },
  });
};

export const cacheConfig: InMemoryCacheConfig = {
  typePolicies: {
    ChatPayload: {
      fields: {
        reactions: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
      },
    },
    ReactionPayload: {
      keyFields: false,
    },
  },
};