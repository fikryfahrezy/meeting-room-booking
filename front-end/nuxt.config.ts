// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  // The whole app requires authentication and uses MSW (a browser-only service
  // worker) for API mocking. SSR cannot access sessionStorage or intercept MSW
  // requests, so it always produces an unauthenticated/empty render that
  // mismatches the hydrated client. Disabling SSR globally turns Nuxt into a
  // pure SPA for this project; re-enable selectively when a real backend is
  // deployed and public/pre-renderable routes exist.
  ssr: false,

  imports: {
    autoImport: false,
  },

  components: [{ path: "~/components", pathPrefix: false }],

  modules: [
    "@nuxt/a11y",
    "@nuxt/eslint",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/ui",
    "@nuxt/test-utils",
    "@pinia/nuxt",
    "@vueuse/nuxt",
  ],

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    public: {
      // Nuxt automatically overrides this with NUXT_PUBLIC_API_BASE at runtime.
      apiBase: "http://localhost:8080",
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: "en" },
      title: "RoomBooker",
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,600&display=swap",
        },
      ],
    },
  },

  nitro: {
    preset: "bun",
  },

  vite: {
    optimizeDeps: {
      include: [
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "msw/browser",
        "msw",
      ],
    },
  },
});
