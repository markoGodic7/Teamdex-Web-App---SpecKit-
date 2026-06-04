import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes
      gcTime: 60 * 60 * 1000,    // 1 hour (cache retention)
      retry: 1,
      refetchOnWindowFocus: false, // Prevent unnecessary refetches  
    },
  },
});

// Preload name index and first-page details to improve perceived performance
import { listPokemonNames, getPokemon } from './lib/api';
(async function prefetchStartup() {
  try {
    const names = await queryClient.fetchQuery({
      queryKey: ['names'],
      queryFn: () => listPokemonNames(),
    });
    const first = names.slice(0, 12);
    for (const item of first) {
      const match = /\/pokemon\/(\d+)\/?$/.exec(item.url);
      const id = match ? Number(match[1]) : null;
      if (id != null) {
        queryClient.prefetchQuery(['pokemon', id], () => getPokemon(id));
      }
    }
  } catch (e) {
    // ignore prefetch errors
  }
})();


const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found. Ensure index.html contains <div id='root'></div>");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
