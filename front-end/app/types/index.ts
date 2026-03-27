/* ─────────────────────────────────────────────────────────────────────────
 * Domain types — single source of truth for all entities used across
 * pages, components, stores, and composables.
 * ───────────────────────────────────────────────────────────────────────── */

export type UserRole = "MEMBER" | "ADMIN";
export type BookingStatus = "ACTIVE" | "CANCELED";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  isActive: boolean;
}

export interface BookedRange {
  startAt: string; // ISO 8601
  endAt: string; // ISO 8601
}

export interface RoomWithAvailability extends Room {
  isAvailable: boolean;
  bookedRanges: BookedRange[];
}

export interface Booking {
  id: string;
  room: { id: string; name: string };
  startAt: string; // ISO 8601
  endAt: string; // ISO 8601
  status: BookingStatus;
  createdAt: string;
  canceledAt?: string;
}

export interface BookingRequest {
  roomId: string;
  startAt: string; // ISO 8601
  endAt: string; // ISO 8601
}

export interface ApiError {
  code: string;
  message: string;
}
