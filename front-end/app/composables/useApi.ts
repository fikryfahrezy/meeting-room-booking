import { useRuntimeConfig } from "#app";

/**
 * useApi — thin wrapper around $fetch that attaches the backend base URL
 * from runtimeConfig and sends session cookies on every request.
 *
 * All store actions go through this composable so the API base URL is
 * configured in exactly one place (NUXT_PUBLIC_API_BASE env var).
 */
export function useApi() {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase as string;

  async function get<T>(
    path: string,
    params?: Record<string, string>,
  ): Promise<T> {
    return await $fetch<T>(path, {
      baseURL,
      params,
      credentials: "include",
    });
  }

  async function post<T>(
    path: string,
    body: Record<string, unknown> | object,
  ): Promise<T> {
    return await $fetch<T>(path, {
      method: "POST",
      baseURL,
      body,
      credentials: "include",
    });
  }

  async function put<T>(
    path: string,
    body: Record<string, unknown>,
  ): Promise<T> {
    return await $fetch<T>(path, {
      method: "PUT",
      baseURL,
      body,
      credentials: "include",
    });
  }

  async function patch<T>(
    path: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    return await $fetch<T>(path, {
      method: "PATCH",
      baseURL,
      body,
      credentials: "include",
    });
  }

  async function del<T>(path: string): Promise<T> {
    return await $fetch<T>(path, {
      method: "DELETE",
      baseURL,
      credentials: "include",
    });
  }

  return { get, post, put, patch, del };
}
