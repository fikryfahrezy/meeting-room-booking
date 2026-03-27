<script setup lang="ts">
import { computed } from "vue";
const model = defineModel<string>({ required: true });

const today = new Date().toISOString().slice(0, 10);

const formattedDate = computed(() => {
  if (!model.value) return "";
  // Add time component to avoid timezone shifting the day
  return new Date(`${model.value}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
});
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <!-- Date input -->
    <label
      class="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 shadow-sm transition-colors hover:border-stone-300"
    >
      <UIcon
        name="i-heroicons-calendar-days"
        class="h-4 w-4 shrink-0 text-stone-400"
      />
      <input
        v-model="model"
        type="date"
        :min="today"
        aria-label="Select date"
        class="cursor-pointer border-none bg-transparent text-sm font-medium text-stone-900 outline-none"
      />
    </label>

    <!-- Human-readable label -->
    <span v-if="formattedDate" class="text-sm font-medium text-stone-500">
      {{ formattedDate }}
    </span>
  </div>
</template>
