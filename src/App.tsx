import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { AppRouterProvider } from "./router/index";
import "./styles/index.css";

/**
 * Apollo Client configured for the public Rick & Morty GraphQL endpoint.
 * Using a simple in-memory cache for now; we can tune cache policy later.
 */
const httpLink = createHttpLink({
  uri: "https://rickandmortyapi.com/graphql",
});

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AppRouterProvider />
    </ApolloProvider>
  );
}
