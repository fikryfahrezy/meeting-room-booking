import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E test configuration.
 *
 * Projects:
 *   setup  — authenticates seed users and writes .auth/*.json storage snapshots.
 *   guest  — tests that run without authentication (login page).
 *   member — tests running as Alice (MEMBER role); depends on setup.
 *   admin  — tests running as Admin (ADMIN role); depends on setup.
 */
export default defineConfig({
  testDir: "./e2e",

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? "50%" : undefined,

  reporter: process.env.CI
    ? [["html", { open: "never" }], ["list"]]
    : [["html", { open: "on-failure" }]],

  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    // ── Auth setup: writes .auth/member.json + .auth/admin.json ─────────────
    {
      name: "setup",
      testMatch: "**/setup/**/*.setup.ts",
    },

    // ── Guest (no auth): login-page tests ───────────────────────────────────
    {
      name: "guest",
      use: { ...devices["Desktop Chrome"] },
      testMatch: "**/login.spec.ts",
    },

    // ── Member (alice@example.com): rooms + bookings tests ──────────────────
    {
      name: "member",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/member.json",
      },
      testMatch: ["**/rooms.spec.ts", "**/bookings.spec.ts"],
      dependencies: ["setup"],
    },

    // ── Admin (admin@example.com): admin-rooms tests ─────────────────────────
    {
      name: "admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/admin.json",
      },
      testMatch: "**/admin-rooms.spec.ts",
      dependencies: ["setup"],
    },
  ],

  webServer: {
    // MSW only starts in dev mode; always use `bun run dev`.
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
