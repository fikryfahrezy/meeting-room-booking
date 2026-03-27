/**
 * In-memory database for MSW handlers.
 *
 * Exported arrays and helpers are mutable — handlers read and write them
 * directly to simulate real backend state within one browser session.
 */
import type { Booking, BookingStatus, Room, User, UserRole } from "~/types";

// ── Extended internal type ────────────────────────────────────────────────────
// Bookings stored in memory carry a userId for ownership checks.
// The userId is NOT returned by the API (stripped in responses).
export interface StoredBooking extends Booking {
  userId: string;
}

// ── ID generator ─────────────────────────────────────────────────────────────
let _seq = 1;
export function nextId(prefix: string): string {
  return `${prefix}_${Date.now()}_${_seq++}`;
}

// ── Seed users ────────────────────────────────────────────────────────────────
export interface SeedUser extends User {
  password: string;
}

export const SEED_USERS: SeedUser[] = [
  {
    id: "usr_1",
    email: "admin@example.com",
    fullName: "Admin User",
    role: "ADMIN" as UserRole,
    password: "password",
  },
  {
    id: "usr_2",
    email: "alice@example.com",
    fullName: "Alice Johnson",
    role: "MEMBER" as UserRole,
    password: "password",
  },
  {
    id: "usr_3",
    email: "bob@example.com",
    fullName: "Bob Smith",
    role: "MEMBER" as UserRole,
    password: "password",
  },
];

// ── Seed rooms ────────────────────────────────────────────────────────────────
export const rooms: Room[] = [
  {
    id: "room_1",
    name: "Board Room",
    capacity: 12,
    location: "Floor 2 – Building A",
    isActive: true,
  },
  {
    id: "room_2",
    name: "Focus Room A",
    capacity: 4,
    location: "Floor 3 – Building A",
    isActive: true,
  },
  {
    id: "room_3",
    name: "Focus Room B",
    capacity: 4,
    location: "Floor 3 – Building B",
    isActive: true,
  },
  {
    id: "room_4",
    name: "Training Room",
    capacity: 20,
    location: "Floor 1 – Building B",
    isActive: true,
  },
  {
    id: "room_5",
    name: "Breakout Area",
    capacity: 8,
    location: "Floor 1 – Main",
    isActive: false,
  },
];

// ── In-memory bookings ────────────────────────────────────────────────────────
// Seeded with a few existing bookings on today's date for demo purposes.
const _today = new Date().toISOString().slice(0, 10);

export const bookings: StoredBooking[] = [
  {
    id: "bk_1",
    userId: "usr_2", // Alice owns this
    room: { id: "room_1", name: "Board Room" },
    startAt: `${_today}T09:00:00`,
    endAt: `${_today}T10:30:00`,
    status: "ACTIVE" as BookingStatus,
    createdAt: new Date().toISOString(),
  },
  {
    id: "bk_2",
    userId: "usr_3", // Bob owns this
    room: { id: "room_2", name: "Focus Room A" },
    startAt: `${_today}T14:00:00`,
    endAt: `${_today}T15:00:00`,
    status: "ACTIVE" as BookingStatus,
    createdAt: new Date().toISOString(),
  },
  {
    id: "bk_3",
    userId: "usr_2", // Alice's canceled booking
    room: { id: "room_1", name: "Board Room" },
    startAt: `${_today}T11:00:00`,
    endAt: `${_today}T12:00:00`,
    status: "CANCELED" as BookingStatus,
    createdAt: new Date().toISOString(),
    canceledAt: new Date().toISOString(),
  },
];

// ── Session (simulates an HTTP-only cookie) ───────────────────────────────────
// Backed by localStorage so Playwright's storageState can capture and restore it.
const SESSION_KEY = "msw_session_user_id";

export function getSessionUser(): SeedUser | null {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return SEED_USERS.find((u) => u.id === id) ?? null;
}

export function setSession(userId: string): void {
  localStorage.setItem(SESSION_KEY, userId);
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ── Booking helpers ───────────────────────────────────────────────────────────
function toMinutes(isoOrHHMM: string): number {
  // Handles "2026-03-27T09:00:00" or "09:00" or "09:00:00"
  const timePart = isoOrHHMM.includes("T")
    ? (isoOrHHMM.split("T")[1] ?? isoOrHHMM)
    : isoOrHHMM;
  const [hourStr = "0", minuteStr = "0"] = timePart.split(":");
  return Number(hourStr) * 60 + Number(minuteStr);
}

/**
 * Returns true when [startAt, endAt) overlaps any ACTIVE booking for the
 * same room on the same date (half-open interval: adjacent bookings are OK).
 */
export function hasConflict(
  roomId: string,
  startAt: string,
  endAt: string,
  excludeId?: string,
): boolean {
  const newDate = startAt.slice(0, 10);
  const newStart = toMinutes(startAt);
  const newEnd = toMinutes(endAt);

  return bookings.some((b) => {
    if (b.status !== "ACTIVE") return false;
    if (b.id === excludeId) return false;
    if (b.room.id !== roomId) return false;
    if (b.startAt.slice(0, 10) !== newDate) return false;

    const bStart = toMinutes(b.startAt);
    const bEnd = toMinutes(b.endAt);
    return newStart < bEnd && bStart < newEnd;
  });
}

/**
 * Strip internal fields before sending a booking in an HTTP response.
 */
export function toPublicBooking(b: StoredBooking): Booking {
  const { userId: _userId, ...rest } = b;
  return rest;
}
