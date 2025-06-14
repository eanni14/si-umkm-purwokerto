'use client';

import { ApolloProvider } from "@apollo/client";
import createApolloClient from "./apollo-client";
import { ReactNode } from "react";

// Komponen ini bertugas untuk menyediakan Apollo Client
// ke semua komponen anak di dalamnya.
export default function ApolloProviderWrapper({ children }: { children: ReactNode }) {
  const client = createApolloClient();
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
