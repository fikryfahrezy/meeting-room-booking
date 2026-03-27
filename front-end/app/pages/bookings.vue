<script setup lang="ts">
import { definePageMeta, useAsyncData } from "#imports";
import { ref, computed } from "vue";
import { useBookingsStore } from "~/stores/bookings";
import type { Booking } from "~/types";

definePageMeta({ middleware: "auth" });

const bookingsStore = useBookingsStore();

const {
  data: bookings,
  pending: isLoading,
  refresh,
} = await useAsyncData("my-bookings", () => bookingsStore.fetchMyBookings(), {
  server: false,
  default: () => [] as Booking[],
});

type Filter = "active" | "all" | "canceled";
const activeFilter = ref<Filter>("active");

const tabs: { key: Filter; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "all", label: "All" },
  { key: "canceled", label: "Canceled" },
];

const activeBookings = computed(() =>
  bookings.value.filter((b) => b.status === "ACTIVE"),
);
const canceledBookings = computed(() =>
  bookings.value.filter((b) => b.status === "CANCELED"),
);

const filteredBookings = computed(() => {
  if (activeFilter.value === "active") return activeBookings.value;
  if (activeFilter.value === "canceled") return canceledBookings.value;
  return bookings.value;
});

async function handleCancel(bookingId: string) {
  await bookingsStore.cancelBooking(bookingId);
  await refresh();
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-stone-900">My Bookings</h1>
      <p class="mt-1 text-sm text-stone-500">
        Manage your upcoming and past reservations
      </p>
    </div>

    <!-- Filter tabs -->
    <div class="mb-6 flex w-fit gap-1 rounded-xl bg-stone-100 p-1">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-150"
        :class="
          activeFilter === tab.key
            ? 'bg-white text-stone-900 shadow-sm'
            : 'text-stone-500 hover:text-stone-700'
        "
        @click="activeFilter = tab.key"
      >
        {{ tab.label }}
        <span
          v-if="tab.key === 'active' && activeBookings.length > 0"
          class="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700"
        >
          {{ activeBookings.length }}
        </span>
      </button>
    </div>

    <!-- Booking list -->
    <BookingList
      :bookings="filteredBookings"
      :is-loading="isLoading"
      @cancel="handleCancel"
    />
  </div>
</template>
