import { HttpResponse, http } from "msw";
import { API_BASE } from "~/mocks/config";
import {
  SEED_USERS,
  clearSession,
  getSessionUser,
  setSession,
} from "~/mocks/data/db";

export const authHandlers = [
  // POST /api/v1/auth/login
  http.post(`${API_BASE}/api/v1/auth/login`, async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const user = SEED_USERS.find(
      (u) => u.email === body.email && u.password === body.password,
    );

    if (!user) {
      return HttpResponse.json(
        { code: "INVALID_CREDENTIALS", message: "Invalid email or password." },
        { status: 401 },
      );
    }

    setSession(user.id);

    const { password: _pw, ...publicUser } = user;
    return HttpResponse.json(publicUser, { status: 200 });
  }),

  // POST /api/v1/auth/logout
  http.post(`${API_BASE}/api/v1/auth/logout`, () => {
    clearSession();
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /api/v1/auth/me
  http.get(`${API_BASE}/api/v1/auth/me`, () => {
    const user = getSessionUser();

    if (!user) {
      return HttpResponse.json(
        { code: "UNAUTHORIZED", message: "Not authenticated." },
        { status: 401 },
      );
    }

    const { password: _pw, ...publicUser } = user;
    return HttpResponse.json(publicUser, { status: 200 });
  }),
];
