import { HttpResponse, http } from "msw";
import { API_BASE } from "~/mocks/config";
import { bookings, getSessionUser, rooms } from "~/mocks/data/db";
import type { BookedRange, RoomWithAvailability } from "~/types";

// ── Helper: compute availability status ──────────────────────────────────────
type AvailabilityStatus = "AVAILABLE" | "PARTIAL" | "BOOKED";

function computeStatus(bookedRanges: BookedRange[]): AvailabilityStatus {
  if (bookedRanges.length === 0) return "AVAILABLE";
  const dayMinutes = 8 * 60; // 08:00 – 20:00 = 720 min working window
  const booked = bookedRanges.reduce((sum, r) => {
    const start = timeToMinutes(r.startAt);
    const end = timeToMinutes(r.endAt);
    return sum + (end - start);
  }, 0);
  return booked >= dayMinutes ? "BOOKED" : "PARTIAL";
}

function timeToMinutes(isoOrTime: string): number {
  const timePart = isoOrTime.includes("T")
    ? (isoOrTime.split("T")[1] ?? isoOrTime)
    : isoOrTime;
  const [hourStr = "0", minuteStr = "0"] = timePart.split(":");
  return Number(hourStr) * 60 + Number(minuteStr);
}

export const roomsHandlers = [
  // GET /api/v1/admin/rooms
  http.get(`${API_BASE}/api/v1/admin/rooms`, () => {
    const user = getSessionUser();
    if (!user) {
      return HttpResponse.json(
        { code: "UNAUTHORIZED", message: "Not authenticated." },
        { status: 401 },
      );
    }
    if (user.role !== "ADMIN") {
      return HttpResponse.json(
        { code: "FORBIDDEN", message: "Admin access required." },
        { status: 403 },
      );
    }
    return HttpResponse.json(rooms, { status: 200 });
  }),

  // GET /api/v1/rooms?date=YYYY-MM-DD
  http.get(`${API_BASE}/api/v1/rooms`, ({ request }) => {
    const user = getSessionUser();
    if (!user) {
      return HttpResponse.json(
        { code: "UNAUTHORIZED", message: "Not authenticated." },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const date =
      url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

    const activeRooms = rooms.filter((r) => r.isActive);

    const result: RoomWithAvailability[] = activeRooms.map((room) => {
      const dayBookings = bookings.filter(
        (b) =>
          b.status === "ACTIVE" &&
          b.room.id === room.id &&
          b.startAt.slice(0, 10) === date,
      );

      const bookedRanges: BookedRange[] = dayBookings
        .sort((a, b) => a.startAt.localeCompare(b.startAt))
        .map((b) => ({ startAt: b.startAt, endAt: b.endAt }));

      const availability = computeStatus(bookedRanges);
      return {
        ...room,
        bookedRanges,
        isAvailable: availability !== "BOOKED",
      };
    });

    return HttpResponse.json(result, { status: 200 });
  }),

  // POST /api/v1/admin/rooms
  http.post(`${API_BASE}/api/v1/admin/rooms`, async ({ request }) => {
    const user = getSessionUser();
    if (!user) {
      return HttpResponse.json(
        { code: "UNAUTHORIZED", message: "Not authenticated." },
        { status: 401 },
      );
    }
    if (user.role !== "ADMIN") {
      return HttpResponse.json(
        { code: "FORBIDDEN", message: "Admin access required." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      name?: string;
      location?: string;
      capacity?: number;
    };

    if (!body.name || !body.location || !body.capacity) {
      return HttpResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "name, location and capacity are required.",
        },
        { status: 400 },
      );
    }

    const newRoom = {
      id: `room_${Date.now()}`,
      name: body.name,
      location: body.location,
      capacity: body.capacity,
      isActive: true,
    };
    rooms.push(newRoom);
    return HttpResponse.json(newRoom, { status: 201 });
  }),

  // PUT /api/v1/admin/rooms/:roomId
  http.put(
    `${API_BASE}/api/v1/admin/rooms/:roomId`,
    async ({ params, request }) => {
      const user = getSessionUser();
      if (!user) {
        return HttpResponse.json(
          { code: "UNAUTHORIZED", message: "Not authenticated." },
          { status: 401 },
        );
      }
      if (user.role !== "ADMIN") {
        return HttpResponse.json(
          { code: "FORBIDDEN", message: "Admin access required." },
          { status: 403 },
        );
      }

      const idx = rooms.findIndex((r) => r.id === params.roomId);
      const existing = rooms[idx];
      if (idx === -1 || !existing) {
        return HttpResponse.json(
          { code: "NOT_FOUND", message: "Room not found." },
          { status: 404 },
        );
      }

      const body = (await request.json()) as Partial<(typeof rooms)[0]>;
      const updated = { ...existing, ...body, id: existing.id };
      rooms[idx] = updated;
      return HttpResponse.json(updated, { status: 200 });
    },
  ),

  // PATCH /api/v1/admin/rooms/:roomId
  http.patch(
    `${API_BASE}/api/v1/admin/rooms/:roomId`,
    async ({ params, request }) => {
      const user = getSessionUser();
      if (!user) {
        return HttpResponse.json(
          { code: "UNAUTHORIZED", message: "Not authenticated." },
          { status: 401 },
        );
      }
      if (user.role !== "ADMIN") {
        return HttpResponse.json(
          { code: "FORBIDDEN", message: "Admin access required." },
          { status: 403 },
        );
      }

      const idx = rooms.findIndex((r) => r.id === params.roomId);
      const existing = rooms[idx];
      if (idx === -1 || !existing) {
        return HttpResponse.json(
          { code: "NOT_FOUND", message: "Room not found." },
          { status: 404 },
        );
      }

      const body = (await request.json()) as Partial<(typeof rooms)[0]>;
      const updated = { ...existing, ...body, id: existing.id };
      rooms[idx] = updated;
      return HttpResponse.json(updated, { status: 200 });
    },
  ),
];
