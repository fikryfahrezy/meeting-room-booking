import { defineNuxtPlugin } from "#app";
import { useAuthStore } from "~/stores/auth";

/**
 * auth.client plugin — runs once on the client after hydration.
 *
 * Calls bootstrap() to restore the authenticated user from the server
 * session cookie before any route middleware runs.
 */
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  await authStore.bootstrap();
});
