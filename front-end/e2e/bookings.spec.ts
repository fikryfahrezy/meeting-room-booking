import { test, expect } from "@playwright/test";
import { BookingsPage } from "./pom/BookingsPage";

/**
 * Bookings page tests — run in the "member" project (authenticated as Alice).
 *
 * Alice's seed bookings (db.ts):
 *   bk_1  Board Room   09:00–10:30  ACTIVE
 *   bk_3  Board Room   11:00–12:00  CANCELED
 */
test.describe("Bookings page", () => {
  let bookingsPage: BookingsPage;

  test.beforeEach(async ({ page }) => {
    bookingsPage = new BookingsPage(page);
    await bookingsPage.goto();
    await page.waitForLoadState("networkidle");
  });

  test("shows the My Bookings heading", async () => {
    await expect(bookingsPage.heading).toBeVisible();
  });

  test("shows Active, All and Canceled filter tabs", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Active" })).toBeVisible();
    await expect(page.getByRole("button", { name: "All" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Canceled" })).toBeVisible();
  });

  test("shows active bookings by default", async () => {
    await bookingsPage.expectBookingVisible("Board Room");
    // Alice has exactly one active booking → one Cancel button
    await expect(bookingsPage.cancelButtons).toHaveCount(1);
  });

  test("All tab shows both active and canceled bookings", async ({ page }) => {
    await bookingsPage.switchTab("All");
    // Two Board Room entries (one active, one canceled)
    await expect(page.getByText("Board Room")).toHaveCount(2);
  });

  test("Canceled tab shows only canceled bookings", async ({ page }) => {
    await bookingsPage.switchTab("Canceled");
    await expect(page.getByText("Board Room").first()).toBeVisible();
    // No Cancel buttons on canceled items
    await expect(bookingsPage.cancelButtons).toHaveCount(0);
  });

  test("can cancel an active booking", async ({ page }) => {
    // One visible Cancel button → click it
    await bookingsPage.cancelButtons.click();

    // Active tab now shows the empty state (the only active booking was canceled)
    await expect(bookingsPage.cancelButtons).toHaveCount(0);
    await expect(page.getByText("No bookings to show")).toBeVisible();
  });
});
