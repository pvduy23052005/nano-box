"use client";

import {
  ApolloClient,
  InMemoryCache,
  ApolloNextAppProvider,
} from "@apollo/client-integration-nextjs";
import { PropsWithChildren } from "react";
import { createHttpLink } from "./apolloBase";
import Cookies from "js-cookie";

function makeClient() {
  const token = Cookies.get("accessToken") || "";

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: createHttpLink(token),
  });
}

export function ApolloProvider({ children }: PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
