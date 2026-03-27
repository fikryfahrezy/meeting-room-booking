import { defineNuxtPlugin } from "#app";

/**
 * MSW browser worker — dev only, client only.
 *
 * The service worker script (mockServiceWorker.js) must exist under /public.
 * Run `bun run msw:init` once after installing dependencies to generate it.
 */
export default defineNuxtPlugin(async () => {
  if (!import.meta.dev) return;

  try {
    const { worker } = await import("~/mocks/browser");
    await worker.start({
      // Let non-mocked requests (CDN, fonts, Nuxt internals) pass through silently.
      onUnhandledRequest: "bypass",
    });
  } catch {
    console.warn(
      "[MSW] Failed to start service worker. " +
        "Run 'bun run msw:init' to initialise the worker script, then reload.",
    );
  }
});
