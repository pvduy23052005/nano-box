"use client";

import {
  ApolloClient,
  InMemoryCache,
  ApolloNextAppProvider,
} from "@apollo/client-integration-nextjs";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { onError } from "@apollo/client/link/error";
import { PropsWithChildren } from "react";
import { createHttpLink } from "./apolloBase";
import Cookies from "js-cookie";
import { handleGlobalError } from "./utils/handleGlobalError";

function makeClient() {
  const token = Cookies.get("accessToken") || "";

  const errorLink = onError(({ error }) => {
    const graphQLErrors = CombinedGraphQLErrors.is(error)
      ? error.errors
      : undefined;
    const networkError = CombinedGraphQLErrors.is(error) ? undefined : error;
    handleGlobalError(graphQLErrors, networkError);
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: errorLink.concat(createHttpLink(token)),
  });
}

export function ApolloProvider({ children }: PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
