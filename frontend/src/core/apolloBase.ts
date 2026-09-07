import { HttpLink } from "@apollo/client";

export const createHttpLink = (token?: string | null) => {
  let uri =
    process.env.NEXT_PUBLIC_GRAPHQL_API_URL ||
    process.env.NEXT_PUBLIC_GRAPHQL_URI;

  if (!uri) {
    if (typeof window !== "undefined") {
      uri =
        window.location.port === "3000"
          ? "http://localhost:5050/graphql"
          : "/graphql";
    } else {
      uri =
        process.env.INTERNAL_GRAPHQL_API_URL ||
        (process.env.NODE_ENV === "production"
          ? "http://nano_box_backend:5050/graphql"
          : "http://localhost:5050/graphql");
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