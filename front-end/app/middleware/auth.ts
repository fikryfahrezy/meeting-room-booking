import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { useAuthStore } from "~/stores/auth";

/**
 * auth middleware — redirects unauthenticated users to /login.
 *
 * Skipped on the server so SSR pages still render; the client-side auth
 * plugin (plugins/auth.client.ts) bootstraps the store before any
 * navigation guard runs.
 */
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return;

  const authStore = useAuthStore();
  if (!authStore.isAuthenticated) {
    return navigateTo("/login");
  }
});
