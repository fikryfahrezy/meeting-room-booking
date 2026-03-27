<script setup lang="ts">
import { computed } from "vue";
import type { Booking } from "~/types";

const props = defineProps<{ booking: Booking }>();
const emit = defineEmits<{ cancel: [] }>();

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const isActive = computed(() => props.booking.status === "ACTIVE");
</script>

<template>
  <div
    class="flex items-center justify-between gap-4 rounded-xl border bg-white px-5 py-4 transition-opacity"
    :class="[
      isActive
        ? 'border-stone-200 hover:border-stone-300'
        : 'border-stone-100 opacity-60',
    ]"
  >
    <!-- Info -->
    <div class="min-w-0 flex-1 space-y-1">
      <div class="flex flex-wrap items-center gap-2">
        <span class="truncate text-sm font-medium text-stone-900">
          {{ booking.room.name }}
        </span>
        <span
          class="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium"
          :class="
            isActive
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-stone-100 text-stone-500'
          "
        >
          {{ isActive ? "Active" : "Canceled" }}
        </span>
      </div>
      <p class="flex items-center gap-1.5 text-sm text-stone-500">
        <UIcon name="i-heroicons-calendar" class="h-3.5 w-3.5 shrink-0" />
        {{ formatDate(booking.startAt) }}
        <span class="text-stone-300">·</span>
        <UIcon name="i-heroicons-clock" class="h-3.5 w-3.5 shrink-0" />
        {{ formatTime(booking.startAt) }} – {{ formatTime(booking.endAt) }}
      </p>
    </div>

    <!-- Cancel action  -->
    <UButton
      v-if="isActive"
      variant="ghost"
      color="error"
      size="sm"
      class="shrink-0"
      @click="emit('cancel')"
    >
      Cancel
    </UButton>
  </div>
</template>
