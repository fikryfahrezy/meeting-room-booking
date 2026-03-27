import { test, expect } from "@playwright/test";
import { RoomsPage } from "./pom/RoomsPage";

/**
 * Rooms page tests — run in the "member" project (authenticated as Alice).
 *
 * Seed data (db.ts):
 *   Active rooms: Board Room, Focus Room A, Focus Room B, Training Room  (4)
 *   Inactive room: Breakout Area                                          (1, hidden)
 *   Today's bookings visible on Board Room: 09:00–10:30 (Alice)
 */
test.describe("Rooms page", () => {
  let roomsPage: RoomsPage;

  test.beforeEach(async ({ page }) => {
    roomsPage = new RoomsPage(page);
    await roomsPage.goto();
    await page.waitForLoadState("networkidle");
  });

  test("shows the Meeting Rooms heading", async () => {
    await expect(roomsPage.heading).toBeVisible();
  });

  test("shows the date filter input", async () => {
    await expect(roomsPage.dateInput).toBeVisible();
  });

  test("displays cards for all active rooms", async () => {
    // 4 active rooms from seed data
    await expect(roomsPage.roomCards).toHaveCount(4);
  });

  test("each card shows name, location and capacity", async () => {
    const card = roomsPage.roomCard("Board Room");
    await expect(card).toBeVisible();
    await expect(card).toContainText("Floor 2 – Building A");
    await expect(card).toContainText("12 people");
  });

  test("inactive rooms are not shown", async () => {
    await expect(roomsPage.roomCard("Breakout Area")).toHaveCount(0);
  });

  test("can open the booking dialog for a room", async () => {
    await roomsPage.clickBookRoom("Focus Room B");
    await roomsPage.expectDialogVisible("Focus Room B");
  });

  test("booking dialog shows room details", async ({ page }) => {
    await roomsPage.clickBookRoom("Focus Room B");
    const dialog = page.getByRole("dialog", { name: "Book Focus Room B" });
    // Location and capacity are shown inside the dialog
    await expect(dialog).toContainText("Floor 3 – Building B");
    await expect(dialog).toContainText("4 people");
  });

  test("booking dialog validates that end time is after start time", async ({
    page,
  }) => {
    await roomsPage.clickBookRoom("Focus Room B");
    const dialog = page.getByRole("dialog", { name: "Book Focus Room B" });

    await dialog.getByLabel("Start time").fill("15:00");
    await dialog.getByLabel("End time").fill("10:00");
    await dialog.getByRole("button", { name: "Confirm booking" }).click();

    await expect(
      dialog.getByText("End time must be after start time."),
    ).toBeVisible();
  });

  test("can successfully book a room", async ({ page }) => {
    await roomsPage.clickBookRoom("Focus Room B");
    const dialog = page.getByRole("dialog", { name: "Book Focus Room B" });

    await dialog.getByLabel("Start time").fill("11:00");
    await dialog.getByLabel("End time").fill("12:00");
    await dialog.getByRole("button", { name: "Confirm booking" }).click();

    // Dialog closes after successful booking
    await expect(dialog).not.toBeVisible();
    // Wait for the rooms list refresh to complete before checking the card
    await page.waitForLoadState("networkidle");
    // Room cards refresh — Focus Room B now shows a booked time
    await expect(roomsPage.roomCard("Focus Room B")).toContainText("11:00");
  });

  test("closing the booking dialog returns to the rooms list", async ({
    page,
  }) => {
    await roomsPage.clickBookRoom("Board Room");
    const dialog = page.getByRole("dialog", { name: "Book Board Room" });

    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).not.toBeVisible();
    await expect(roomsPage.heading).toBeVisible();
  });

  test("non-admin member is redirected from /admin/rooms to /", async ({
    page,
  }) => {
    await page.goto("/admin/rooms");
    await page.waitForURL("/");
    await expect(roomsPage.heading).toBeVisible();
  });
});
