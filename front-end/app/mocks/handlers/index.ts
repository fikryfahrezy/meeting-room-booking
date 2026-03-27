import { adminHandlers } from "./admin";
import { authHandlers } from "./auth";
import { bookingsHandlers } from "./bookings";
import { roomsHandlers } from "./rooms";

export const handlers = [
  ...authHandlers,
  ...roomsHandlers,
  ...bookingsHandlers,
  ...adminHandlers,
];
