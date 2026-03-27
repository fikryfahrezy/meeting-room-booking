import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { useAuthStore } from "~/stores/auth";

/**
 * admin middleware — restricts a page to users with the ADMIN role.
 * Apply after the auth middleware: `middleware: ['auth', 'admin']`.
 */
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return;

  const authStore = useAuthStore();
  if (!authStore.isAdmin) {
    return navigateTo("/");
  }
});
