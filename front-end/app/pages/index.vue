<script setup lang="ts">
import { ref } from "vue";
import { useAsyncData } from "#app";
import type { RoomWithAvailability } from "~/types";
import { useRoomsStore } from "~/stores/rooms";
import { definePageMeta } from "#imports";

definePageMeta({ middleware: "auth" });

const selectedDate = ref(new Date().toISOString().slice(0, 10));
const roomsStore = useRoomsStore();

const {
  data: rooms,
  pending: isLoading,
  error,
  refresh,
} = await useAsyncData(
  "rooms",
  () => roomsStore.fetchRooms(selectedDate.value),
  {
    server: false,
    default: () => [] as RoomWithAvailability[],
    watch: [selectedDate],
  },
);

const selectedRoom = ref<RoomWithAvailability | null>(null);
const showBookingDialog = ref(false);

function openBookingDialog(room: RoomWithAvailability) {
  selectedRoom.value = room;
  showBookingDialog.value = true;
}

async function onBookingCreated() {
  showBookingDialog.value = false;
  await refresh();
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-stone-900">Meeting Rooms</h1>
      <p class="mt-1 text-sm text-stone-500">
        Check availability and book a room for your team
      </p>
    </div>

    <!-- Date filter -->
    <DateFilter v-model="selectedDate" class="mb-8" />

    <!-- Loading skeleton -->
    <div
      v-if="isLoading"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="i in 6"
        :key="i"
        class="h-52 animate-pulse rounded-xl bg-stone-100"
      />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="py-16 text-center">
      <UIcon
        name="i-heroicons-exclamation-triangle"
        class="mx-auto mb-3 h-10 w-10 text-stone-300"
      />
      <p class="mb-4 text-stone-500">{{ error.message }}</p>
      <UButton variant="ghost" color="neutral" @click="refresh()">
        Try again
      </UButton>
    </div>

    <!-- Empty state -->
    <div v-else-if="rooms.length === 0" class="py-16 text-center">
      <UIcon
        name="i-heroicons-building-office-2"
        class="mx-auto mb-3 h-10 w-10 text-stone-300"
      />
      <p class="text-stone-500">No rooms found for this date.</p>
    </div>

    <!-- Room grid -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RoomCard
        v-for="room in rooms"
        :key="room.id"
        :room="room"
        @book="openBookingDialog(room)"
      />
    </div>

    <!-- Booking dialog — mounted conditionally so it unmounts on close -->
    <BookingDialog
      v-if="showBookingDialog && selectedRoom"
      :room="selectedRoom"
      :date="selectedDate"
      @close="showBookingDialog = false"
      @created="onBookingCreated"
    />
  </div>
</template>
