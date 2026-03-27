// defineAppConfig is an identity helper; Nuxt's vite transform does the real merging.
// Importing it from #app or nuxt/app triggers the impound proxy restriction in this file,
// so we declare it inline (which is exactly what the Nuxt source does: `config => config`).
function defineAppConfig<T>(config: T): T {
  return config;
}

export default defineAppConfig({
  ui: {
    colors: {
      primary: "blue",
      neutral: "stone",
    },
  },
});
