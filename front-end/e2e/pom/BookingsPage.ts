import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object for /bookings.
 */
export class BookingsPage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "My Bookings", level: 1 });
  }

  async goto() {
    await this.page.goto("/bookings");
  }

  /** Clicks one of the Active / All / Canceled filter tab buttons. */
  async switchTab(label: string) {
    await this.page.getByRole("button", { name: label }).click();
  }

  /** Returns all visible "Cancel" buttons (one per active booking item). */
  get cancelButtons(): Locator {
    return this.page.getByRole("button", { name: "Cancel", exact: true });
  }

  /** Asserts the booking list item for `roomName` is visible. */
  async expectBookingVisible(roomName: string) {
    await expect(this.page.getByText(roomName).first()).toBeVisible();
  }
}
