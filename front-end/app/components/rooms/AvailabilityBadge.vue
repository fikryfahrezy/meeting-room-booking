<script setup lang="ts">
import { computed } from "vue";
import type { BookedRange } from "~/types";

const props = defineProps<{
  isAvailable: boolean;
  bookedRanges?: BookedRange[];
}>();

type StatusKey = "available" | "partial" | "booked";

const status = computed<StatusKey>(() => {
  if (!props.bookedRanges?.length) return "available";
  return props.isAvailable ? "partial" : "booked";
});

const config: Record<
  StatusKey,
  { label: string; classes: string; icon: string }
> = {
  available: {
    label: "Available",
    classes: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
    icon: "i-heroicons-check-circle",
  },
  partial: {
    label: "Partially booked",
    classes: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
    icon: "i-heroicons-clock",
  },
  booked: {
    label: "Fully booked",
    classes: "bg-red-50 text-red-600 ring-1 ring-red-200/60",
    icon: "i-heroicons-x-circle",
  },
};
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
    :class="config[status].classes"
  >
    <UIcon :name="config[status].icon" class="h-3.5 w-3.5 shrink-0" />
    {{ config[status].label }}
  </span>
</template>
