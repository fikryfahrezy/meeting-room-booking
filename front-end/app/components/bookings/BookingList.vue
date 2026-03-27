<script setup lang="ts">
import type { Booking } from "~/types";

defineProps<{
  bookings: Booking[];
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  cancel: [bookingId: string];
}>();
</script>

<template>
  <div>
    <!-- Loading skeleton -->
    <div v-if="isLoading" class="space-y-3">
      <div
        v-for="i in 3"
        :key="i"
        class="h-20 animate-pulse rounded-xl bg-stone-100"
      />
    </div>

    <!-- Empty state -->
    <div v-else-if="bookings.length === 0" class="py-16 text-center">
      <UIcon
        name="i-heroicons-calendar-days"
        class="mx-auto mb-3 h-12 w-12 text-stone-200"
      />
      <p class="text-sm text-stone-500">No bookings to show</p>
    </div>

    <!-- List -->
    <div v-else class="space-y-3">
      <BookingListItem
        v-for="booking in bookings"
        :key="booking.id"
        :booking="booking"
        @cancel="emit('cancel', booking.id)"
      />
    </div>
  </div>
</template>
