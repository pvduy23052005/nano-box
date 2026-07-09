import { ApolloClient, InMemoryCache } from "@apollo/client";
import { registerApolloClient } from "@apollo/client-integration-nextjs";
import { cookies } from "next/headers";
import { createHttpLink } from "./apolloBase";

export const { getClient, query, PreloadQuery } = registerApolloClient(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value || "";

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: createHttpLink(token),
  });
});