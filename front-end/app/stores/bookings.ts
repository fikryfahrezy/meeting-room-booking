import { defineStore } from "pinia";
import { useApi } from "~/composables/useApi";
import type { Booking, BookingRequest } from "~/types";

export const useBookingsStore = defineStore("bookings", () => {
  async function fetchMyBookings() {
    const api = useApi();
    return await api.get<Booking[]>("/api/v1/bookings/me");
  }

  async function createBooking(req: BookingRequest): Promise<Booking> {
    const api = useApi();
    return await api.post<Booking>("/api/v1/bookings", req);
  }

  async function cancelBooking(bookingId: string): Promise<Booking> {
    const api = useApi();
    return await api.post<Booking>(`/api/v1/bookings/${bookingId}/cancel`, {});
  }

  return { fetchMyBookings, createBooking, cancelBooking };
});
