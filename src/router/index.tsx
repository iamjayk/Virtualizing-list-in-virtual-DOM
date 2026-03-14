import * as React from "react";
import {
  RouterProvider,
  createRouter,
  Route,
  RootRoute,
  Outlet,
} from "@tanstack/react-router";
import Home from "../pages/Home";
import CharacterDetail from "../pages/CharacterDetail";

// Root route
const rootRoute = new RootRoute({
  component: () => (
    <React.Suspense fallback={<div>Loading…</div>}>
      <Outlet />
    </React.Suspense>
  ),
});

// Home route
const homeRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

// Character detail route
const characterDetailRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/character/$id",
  component: CharacterDetail,
});

// Route tree
const routeTree = rootRoute.addChildren([homeRoute, characterDetailRoute]);

// Create the router
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  basepath: "/Virtualizing-list-in-virtual-DOM/",
});

// Export the provider for use in App.tsx
export function AppRouterProvider() {
  return <RouterProvider router={router} />;
}

// Export router for navigation hooks if needed elsewhere
export { router };
