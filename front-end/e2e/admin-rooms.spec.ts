import { test, expect } from "@playwright/test";
import { AdminRoomsPage } from "./pom/AdminRoomsPage";

/**
 * Admin rooms management tests — run in the "admin" project.
 *
 * Seed data (db.ts):
 *   room_1  Board Room       capacity 12  active
 *   room_2  Focus Room A     capacity 4   active
 *   room_3  Focus Room B     capacity 4   active
 *   room_4  Training Room    capacity 20  active
 *   room_5  Breakout Area    capacity 8   inactive
 */
test.describe("Admin rooms page", () => {
  let adminPage: AdminRoomsPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminRoomsPage(page);
    await adminPage.goto();
    await page.waitForLoadState("networkidle");
  });

  test("shows the Room Management heading", async () => {
    await expect(adminPage.heading).toBeVisible();
  });

  test("shows all rooms including inactive ones", async ({ page }) => {
    // All 5 seed rooms (4 active + 1 inactive) must be listed
    for (const name of [
      "Board Room",
      "Focus Room A",
      "Focus Room B",
      "Training Room",
      "Breakout Area",
    ]) {
      await expect(page.getByText(name).first()).toBeVisible();
    }
  });

  test("shows the Add room button", async () => {
    await expect(adminPage.addRoomButton).toBeVisible();
  });

  // ── Add room ─────────────────────────────────────────────────────────────

  test("opens the Add room modal when Add room is clicked", async ({
    page,
  }) => {
    await adminPage.openAddRoomModal();
    await expect(page.getByRole("dialog", { name: "Add room" })).toBeVisible();
  });

  test("shows validation errors when the form is submitted empty", async ({
    page,
  }) => {
    await adminPage.openAddRoomModal();
    await adminPage.submitForm();

    await expect(
      page.getByRole("alert").filter({ hasText: "Name is required" }),
    ).toBeVisible();
    await expect(
      page.getByRole("alert").filter({ hasText: "Location is required" }),
    ).toBeVisible();
  });

  test("can add a new room", async ({ page }) => {
    await adminPage.openAddRoomModal();
    await adminPage.fillRoomForm("Zen Room", "Floor 5 – North", 6);
    await adminPage.submitForm();

    // Dialog closes and new room appears in the list
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.waitForLoadState("networkidle");
    await adminPage.expectRoomVisible("Zen Room");
  });

  // ── Edit room ─────────────────────────────────────────────────────────────

  test("opens the Edit room modal with pre-filled values", async ({ page }) => {
    await adminPage.editRoom("Focus Room A");

    const dialog = page.getByRole("dialog", { name: "Edit Focus Room A" });
    await expect(dialog).toBeVisible();
    // Inputs are pre-filled with existing values
    await expect(adminPage.roomNameInput).toHaveValue("Focus Room A");
    await expect(adminPage.roomLocationInput).toHaveValue(
      "Floor 3 – Building A",
    );
    await expect(adminPage.roomCapacityInput).toHaveValue("4");
  });

  test("can save edits to an existing room", async ({ page }) => {
    await adminPage.editRoom("Focus Room A");

    await adminPage.roomNameInput.clear();
    await adminPage.roomNameInput.fill("Focus Room A Renamed");
    await adminPage.submitForm();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.waitForLoadState("networkidle");
    await adminPage.expectRoomVisible("Focus Room A Renamed");
  });

  // ── Toggle active / inactive ──────────────────────────────────────────────

  test("active room shows a Deactivate button", async () => {
    await expect(
      adminPage
        .roomRow("Board Room")
        .getByRole("button", { name: "Deactivate" }),
    ).toBeVisible();
  });

  test("inactive room shows an Activate button", async () => {
    await expect(
      adminPage
        .roomRow("Breakout Area")
        .getByRole("button", { name: "Activate" }),
    ).toBeVisible();
  });

  test("can deactivate an active room", async () => {
    await adminPage.toggleRoom("Board Room");
    // Button text flips to Activate
    await expect(
      adminPage.roomRow("Board Room").getByRole("button", { name: "Activate" }),
    ).toBeVisible();
  });

  test("can activate an inactive room", async () => {
    await adminPage.toggleRoom("Breakout Area");
    // Button text flips to Deactivate
    await expect(
      adminPage
        .roomRow("Breakout Area")
        .getByRole("button", { name: "Deactivate" }),
    ).toBeVisible();
  });
});
