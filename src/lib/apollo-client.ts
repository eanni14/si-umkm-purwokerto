import { ApolloClient, InMemoryCache } from "@apollo/client";

const createApolloClient = () => {
  return new ApolloClient({
    // URI dari endpoint GraphQL kita
    uri: '/api/graphql',
    // InMemoryCache digunakan untuk menyimpan hasil query secara cerdas
    // agar tidak perlu meminta data yang sama berulang kali.
    cache: new InMemoryCache(),
  });
};

export default createApolloClient;
