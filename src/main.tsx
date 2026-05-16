import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

// SPA-only client bootstrap (used by the Vercel build).
// IMPORTANT: Do NOT wrap with <QueryClientProvider> or <AuthProvider> here.
// The root route (src/routes/__root.tsx -> RootComponent) already provides
// QueryClientProvider, I18nProvider, AuthProvider and TooltipProvider.
// Wrapping again here caused duplicate providers, duplicate AuthAPI.me()
// calls on mount, and on Vercel's production build that race re-mounted
// the login form on every keystroke — making the inputs feel "frozen".
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
});

// Defensive: if we land directly on /login, wipe any stale tokens so the
// inner AuthProvider doesn't fire a me() request against a dead session.
if (typeof window !== "undefined" && window.location.pathname.startsWith("/login")) {
  try {
    window.localStorage.removeItem("@ecobus-admin/access");
    window.localStorage.removeItem("@ecobus-admin/refresh");
    window.localStorage.removeItem("@ecobus-admin/user");
  } catch {}
}

const router = createRouter({
  routeTree,
  context: { queryClient },
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootEl = document.getElementById("root")!;
ReactDOM.createRoot(rootEl).render(<RouterProvider router={router} />);
