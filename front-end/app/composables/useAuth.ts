import { computed } from "vue";
import { useAuthStore } from "~/stores/auth";

/**
 * useAuth — convenience composable that surfaces the auth store's most-used
 * reactive state and actions as a flat object.
 *
 * Prefer this over `useAuthStore()` in components and pages so they stay
 * decoupled from the store implementation.
 */
export function useAuth() {
  const authStore = useAuthStore();

  return {
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isAdmin: computed(() => authStore.isAdmin),
    login: authStore.login,
    logout: authStore.logout,
    bootstrap: authStore.bootstrap,
  };
}
