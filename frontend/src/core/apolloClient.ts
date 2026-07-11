import { ApolloClient, InMemoryCache } from "@apollo/client";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { registerApolloClient } from "@apollo/client-integration-nextjs";
import { onError } from "@apollo/client/link/error";
import { cookies } from "next/headers";
import { createHttpLink } from "./apolloBase";
import { handleGlobalError } from "./utils/handleGlobalError";

export const { getClient, query } = registerApolloClient(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value || "";

  const errorLink = onError(({ error }) => {
    const graphQLErrors = CombinedGraphQLErrors.is(error) ? error.errors : undefined;
    const networkError = CombinedGraphQLErrors.is(error) ? undefined : error;
    handleGlobalError(graphQLErrors, networkError);
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: errorLink.concat(createHttpLink(token)),
  });
});