import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { navigateTo } from "#app";
import { useApi } from "~/composables/useApi";
import type { User } from "~/types";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => user.value !== null);
  const isAdmin = computed(() => user.value?.role === "ADMIN");

  /**
   * Sign in with email and password.
   * On success the backend sets an HTTP-only session cookie.
   */
  async function login(email: string, password: string) {
    const api = useApi();
    const data = await api.post<User>("/api/v1/auth/login", {
      email,
      password,
    });
    user.value = data;
  }

  /**
   * Sign out — clears the server session and wipes local state.
   */
  async function logout() {
    const api = useApi();
    await api.post("/api/v1/auth/logout", {});
    user.value = null;
    await navigateTo("/login");
  }

  /**
   * Restore session on app boot by calling the /me endpoint.
   * Silently swallows 401s so unauthenticated users land on /login.
   */
  async function bootstrap() {
    try {
      const api = useApi();
      user.value = await api.get<User>("/api/v1/auth/me");
    } catch {
      user.value = null;
    }
  }

  return { user, isAuthenticated, isAdmin, login, logout, bootstrap };
});
