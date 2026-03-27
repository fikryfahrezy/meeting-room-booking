import { test, expect } from "@playwright/test";
import { LoginPage } from "./pom/LoginPage";

/**
 * Login page tests — run in the "guest" project (no stored auth).
 *
 * Covers:
 *  - Form rendering
 *  - Zod field-level validation (invalid email, empty password)
 *  - Server-side error for wrong credentials
 *  - Redirect of unauthenticated visitors trying to reach protected routes
 *  - Successful login redirects to the rooms page
 */
test.describe("Login page", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await page.waitForLoadState("networkidle");
  });

  test("shows the sign-in form", async ({ page }) => {
    await expect(page).toHaveTitle(/RoomBooker/);
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test("shows a field error for an invalid email format", async () => {
    await loginPage.login("not-an-email", "password");
    await loginPage.expectFieldError("Enter a valid email address");
  });

  test("shows a field error for an empty password", async () => {
    await loginPage.login("alice@example.com", "");
    await loginPage.expectFieldError("Password is required");
  });

  test("shows a server error for wrong credentials", async () => {
    await loginPage.login("alice@example.com", "wrongpassword");
    await loginPage.expectServerError("Invalid email or password.");
  });

  test("redirects an unauthenticated visitor from / to /login", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForURL("/login");
    await expect(loginPage.submitButton).toBeVisible();
  });

  test("successful login redirects to the rooms page", async ({ page }) => {
    await loginPage.login("alice@example.com", "password");
    await page.waitForURL("/");
    await expect(
      page.getByRole("heading", { name: "Meeting Rooms", level: 1 }),
    ).toBeVisible();
  });
});
