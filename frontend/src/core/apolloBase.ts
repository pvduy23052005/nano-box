import { HttpLink, InMemoryCacheConfig } from "@apollo/client";
import { GRAPHQL_TYPENAMES } from "./constants/graphql.constant";

export const createHttpLink = (token?: string | null): HttpLink => {
  const isBrowser = typeof window !== "undefined";
  let uri: string;

  if (isBrowser) {
    uri =
      process.env.NEXT_PUBLIC_GRAPHQL_API_URL ||
      process.env.NEXT_PUBLIC_GRAPHQL_URI ||
      (process.env.NODE_ENV !== "production" && window.location.port === "3000"
        ? "http://localhost:4000/graphql"
        : "/graphql");
  } else {
    uri =
      process.env.INTERNAL_GRAPHQL_API_URL ||
      process.env.NEXT_PUBLIC_GRAPHQL_API_URL ||
      (process.env.NODE_ENV !== "production"
        ? "http://localhost:4000/graphql"
        : "http://nano-box-api-gateway:4000/graphql");
  }

  return new HttpLink({
    uri: (operation) => {
      const customPath = operation.getContext().graphqlPath as
        | string
        | undefined;
      return customPath ? uri.replace(/\/graphql\/?$/, customPath) : uri;
    },
    credentials: "include",
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });
};

export const cacheConfig: InMemoryCacheConfig = {
  typePolicies: {
    [GRAPHQL_TYPENAMES.QUERY]: {
      fields: {
        getRoomsByStatus: {
          keyArgs: ["status", "search"],
          merge(_existing, incoming) {
            return incoming;
          },
        },
      },
    },
    [GRAPHQL_TYPENAMES.ROOM]: {
      fields: {
        members: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
        lastMessageId: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
      },
    },
    [GRAPHQL_TYPENAMES.CHAT_PAYLOAD]: {
      fields: {
        reactions: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
      },
    },
    [GRAPHQL_TYPENAMES.REACTION_PAYLOAD]: {
      keyFields: false,
    },
  },
};
