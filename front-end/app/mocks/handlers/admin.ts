import { HttpResponse, http } from "msw";
import { API_BASE } from "~/mocks/config";
import { bookings, getSessionUser, toPublicBooking } from "~/mocks/data/db";

function requireAdmin() {
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
  return null;
}

export const adminHandlers = [
  // GET /api/v1/admin/bookings — all bookings across all users
  http.get(`${API_BASE}/api/v1/admin/bookings`, ({ request }) => {
    const deny = requireAdmin();
    if (deny) return deny;

    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    const roomId = url.searchParams.get("roomId");

    let result = bookings.slice();

    if (date) {
      result = result.filter((b) => b.startAt.slice(0, 10) === date);
    }
    if (roomId) {
      result = result.filter((b) => b.room.id === roomId);
    }

    result.sort((a, b) => b.startAt.localeCompare(a.startAt));

    return HttpResponse.json(result.map(toPublicBooking), { status: 200 });
  }),
];
