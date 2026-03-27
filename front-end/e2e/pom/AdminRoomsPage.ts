import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object for /admin/rooms.
 */
export class AdminRoomsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly addRoomButton: Locator;
  // Form inputs (scoped to the open dialog)
  readonly roomNameInput: Locator;
  readonly roomLocationInput: Locator;
  readonly roomCapacityInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", {
      name: "Room Management",
      level: 1,
    });
    this.addRoomButton = page.getByRole("button", {
      name: "Add room",
      exact: true,
    });
    // Labels come from the modal form in admin/rooms.vue
    this.roomNameInput = page.getByLabel("Room name");
    this.roomLocationInput = page.getByLabel("Location");
    this.roomCapacityInput = page.getByLabel("Capacity");
  }

  async goto() {
    await this.page.goto("/admin/rooms");
  }

  async openAddRoomModal() {
    await this.addRoomButton.click();
  }

  /**
   * Fills the Add / Edit room form inputs.
   * Call after the modal is open.
   */
  async fillRoomForm(name: string, location: string, capacity: number) {
    await this.roomNameInput.fill(name);
    await this.roomLocationInput.fill(location);
    await this.roomCapacityInput.fill(String(capacity));
  }

  /**
   * Clicks the modal's primary submit button ("Add room" or "Save changes").
   * Scoped to the dialog so it never hits the page-level "Add room" button.
   */
  async submitForm() {
    await this.page
      .getByRole("dialog")
      .getByRole("button", { name: /^(Add room|Save changes)$/ })
      .click();
  }

  /**
   * Returns the table row div for the given room name.
   * Matches the <div class="grid ..."> iterated by v-for in the template.
   */
  roomRow(roomName: string): Locator {
    return this.page
      .locator('div[class*="grid"]')
      .filter({ hasText: roomName });
  }

  async editRoom(roomName: string) {
    await this.roomRow(roomName).getByRole("button", { name: "Edit" }).click();
  }

  async toggleRoom(roomName: string) {
    await this.roomRow(roomName)
      .getByRole("button", { name: /Deactivate|Activate/ })
      .click();
  }

  async expectRoomVisible(roomName: string) {
    await expect(this.page.getByText(roomName).first()).toBeVisible();
  }
}
