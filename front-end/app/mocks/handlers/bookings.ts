import { HttpResponse, http } from "msw";
import { API_BASE } from "~/mocks/config";
import {
  bookings,
  getSessionUser,
  hasConflict,
  nextId,
  rooms,
  toPublicBooking,
} from "~/mocks/data/db";
import type { StoredBooking } from "~/mocks/data/db";
import type { BookingStatus } from "~/types";

export const bookingsHandlers = [
  // GET /api/v1/bookings/me
  http.get(`${API_BASE}/api/v1/bookings/me`, () => {
    const user = getSessionUser();
    if (!user) {
      return HttpResponse.json(
        { code: "UNAUTHORIZED", message: "Not authenticated." },
        { status: 401 },
      );
    }

    const myBookings = bookings
      .filter((b) => b.userId === user.id)
      .sort((a, b) => b.startAt.localeCompare(a.startAt))
      .map(toPublicBooking);

    return HttpResponse.json(myBookings, { status: 200 });
  }),

  // POST /api/v1/bookings
  http.post(`${API_BASE}/api/v1/bookings`, async ({ request }) => {
    const user = getSessionUser();
    if (!user) {
      return HttpResponse.json(
        { code: "UNAUTHORIZED", message: "Not authenticated." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      roomId?: string;
      startAt?: string;
      endAt?: string;
    };

    if (!body.roomId || !body.startAt || !body.endAt) {
      return HttpResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "roomId, startAt and endAt are required.",
        },
        { status: 400 },
      );
    }

    const room = rooms.find((r) => r.id === body.roomId && r.isActive);
    if (!room) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "Room not found or is inactive." },
        { status: 404 },
      );
    }

    if (body.startAt >= body.endAt) {
      return HttpResponse.json(
        { code: "VALIDATION_ERROR", message: "startAt must be before endAt." },
        { status: 400 },
      );
    }

    if (hasConflict(body.roomId, body.startAt, body.endAt)) {
      return HttpResponse.json(
        {
          code: "BOOKING_CONFLICT",
          message: "The selected time slot is already booked.",
        },
        { status: 409 },
      );
    }

    const newBooking = {
      id: nextId("bk"),
      userId: user.id,
      room: { id: room.id, name: room.name },
      startAt: body.startAt,
      endAt: body.endAt,
      status: "ACTIVE" as BookingStatus,
      createdAt: new Date().toISOString(),
    };

    bookings.push(newBooking);
    return HttpResponse.json(toPublicBooking(newBooking), { status: 201 });
  }),

  // POST /api/v1/bookings/:bookingId/cancel
  http.post(`${API_BASE}/api/v1/bookings/:bookingId/cancel`, ({ params }) => {
    const user = getSessionUser();
    if (!user) {
      return HttpResponse.json(
        { code: "UNAUTHORIZED", message: "Not authenticated." },
        { status: 401 },
      );
    }

    const idx = bookings.findIndex((b) => b.id === params.bookingId);
    const booking = bookings[idx];
    if (idx === -1 || !booking) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "Booking not found." },
        { status: 404 },
      );
    }

    // User must own the booking, or be an ADMIN
    if (booking.userId !== user.id && user.role !== "ADMIN") {
      return HttpResponse.json(
        { code: "FORBIDDEN", message: "You do not own this booking." },
        { status: 403 },
      );
    }

    if (booking.status === "CANCELED") {
      return HttpResponse.json(
        { code: "ALREADY_CANCELED", message: "Booking is already canceled." },
        { status: 409 },
      );
    }

    const updated: StoredBooking = {
      ...booking,
      status: "CANCELED",
      canceledAt: new Date().toISOString(),
    };
    bookings[idx] = updated;

    return HttpResponse.json(toPublicBooking(updated), { status: 200 });
  }),
];
