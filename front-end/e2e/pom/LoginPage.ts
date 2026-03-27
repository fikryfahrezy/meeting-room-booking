import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object for /login.
 *
 * Covers the sign-in form, Zod field-level errors, and server-side errors.
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.submitButton = page.getByRole("button", { name: "Sign in" });
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /** Asserts a Zod field-level `role="alert"` containing `text` is visible. */
  async expectFieldError(text: string) {
    await expect(
      this.page.getByRole("alert").filter({ hasText: text }),
    ).toBeVisible();
  }

  /** Asserts the server-side error paragraph (no ARIA role) is visible. */
  async expectServerError(text: string) {
    await expect(this.page.getByText(text)).toBeVisible();
  }
}
