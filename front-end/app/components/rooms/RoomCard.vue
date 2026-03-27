<script setup lang="ts">
import type { RoomWithAvailability } from "~/types";

defineProps<{
  room: RoomWithAvailability;
}>();

const emit = defineEmits<{ book: [] }>();

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
</script>

<template>
  <article
    class="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-5 transition-shadow transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-stone-100"
  >
    <!-- Header row -->
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <h2 class="truncate leading-snug font-semibold text-stone-900">
          {{ room.name }}
        </h2>
        <p class="mt-0.5 flex items-center gap-1 text-sm text-stone-500">
          <UIcon name="i-heroicons-map-pin" class="h-3.5 w-3.5 shrink-0" />
          <span class="truncate">{{ room.location }}</span>
        </p>
      </div>
      <AvailabilityBadge
        :is-available="room.isAvailable"
        :booked-ranges="room.bookedRanges"
        class="shrink-0"
      />
    </div>

    <!-- Capacity -->
    <div class="flex items-center gap-1.5 text-sm text-stone-500">
      <UIcon name="i-heroicons-users" class="h-4 w-4" />
      <span>{{ room.capacity }} people</span>
    </div>

    <!-- Booked ranges -->
    <div v-if="room.bookedRanges.length > 0" class="space-y-1.5">
      <p class="text-xs font-semibold tracking-wider text-stone-400 uppercase">
        Booked times
      </p>
      <div
        v-for="(range, i) in room.bookedRanges"
        :key="i"
        class="flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-600"
      >
        <UIcon name="i-heroicons-clock" class="h-3.5 w-3.5 shrink-0" />
        {{ formatTime(range.startAt) }} – {{ formatTime(range.endAt) }}
      </div>
    </div>

    <!-- Spacer so the button pins to the bottom -->
    <div class="flex-1" />

    <!-- Book action -->
    <UButton
      color="primary"
      variant="solid"
      class="w-full justify-center"
      @click="emit('book')"
    >
      Book room
    </UButton>
  </article>
</template>
