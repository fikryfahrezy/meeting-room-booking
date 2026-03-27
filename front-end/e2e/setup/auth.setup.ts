import { mkdirSync } from "fs";
import { test as setup, expect } from "@playwright/test";

// Ensure .auth/ exists before writing storage state snapshots
mkdirSync(".auth", { recursive: true });

/** Paths are relative to the playwright.config.ts directory (front-end/). */
const MEMBER_AUTH_FILE = ".auth/member.json";
const ADMIN_AUTH_FILE = ".auth/admin.json";

// ── Member (alice@example.com / password) ────────────────────────────────────
setup("authenticate as member", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("alice@example.com");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL("/");
  await expect(
    page.getByRole("heading", { name: "Meeting Rooms", level: 1 }),
  ).toBeVisible();

  await page.context().storageState({ path: MEMBER_AUTH_FILE });
});

// ── Admin (admin@example.com / password) ─────────────────────────────────────
setup("authenticate as admin", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL("/");
  await expect(
    page.getByRole("heading", { name: "Meeting Rooms", level: 1 }),
  ).toBeVisible();

  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});
