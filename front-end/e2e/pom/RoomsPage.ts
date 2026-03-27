import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object for / (rooms listing page).
 */
export class RoomsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly dateInput: Locator;
  readonly roomCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", {
      name: "Meeting Rooms",
      level: 1,
    });
    // DateFilter renders <input type="date" aria-label="Select date">
    this.dateInput = page.getByLabel("Select date");
    // Each room is an <article> element in RoomCard.vue
    this.roomCards = page.locator("article");
  }

  async goto() {
    await this.page.goto("/");
  }

  /** Returns the card article for the given room name. */
  roomCard(roomName: string): Locator {
    return this.roomCards.filter({ hasText: roomName });
  }

  async clickBookRoom(roomName: string) {
    await this.roomCard(roomName)
      .getByRole("button", { name: "Book room" })
      .click();
  }

  async expectDialogVisible(roomName: string) {
    await expect(
      this.page.getByRole("dialog", { name: `Book ${roomName}` }),
    ).toBeVisible();
  }
}
