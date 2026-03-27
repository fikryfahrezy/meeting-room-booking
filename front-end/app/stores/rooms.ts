import { defineStore } from "pinia";
import { useApi } from "~/composables/useApi";
import type { Room, RoomWithAvailability } from "~/types";

export const useRoomsStore = defineStore("rooms", () => {
  async function fetchRooms(date: string) {
    const api = useApi();
    return await api.get<RoomWithAvailability[]>("/api/v1/rooms", { date });
  }

  async function fetchAllRooms() {
    const api = useApi();
    return await api.get<Room[]>("/api/v1/admin/rooms");
  }

  async function createRoom(payload: {
    name: string;
    location: string;
    capacity: number;
  }) {
    const api = useApi();
    return await api.post<Room>("/api/v1/admin/rooms", payload);
  }

  async function updateRoom(
    id: string,
    payload: { name: string; location: string; capacity: number },
  ) {
    const api = useApi();
    return await api.put<Room>(`/api/v1/admin/rooms/${id}`, payload);
  }

  async function toggleActive(room: Room) {
    const api = useApi();
    return await api.patch<Room>(`/api/v1/admin/rooms/${room.id}`, {
      isActive: !room.isActive,
    });
  }

  return {
    fetchRooms,
    fetchAllRooms,
    createRoom,
    updateRoom,
    toggleActive,
  };
});
