<script setup lang="ts">
import { ref, computed } from "vue";
import type { RoomWithAvailability } from "~/types";
import { useBookingsStore } from "~/stores/bookings";

const props = defineProps<{
  room: RoomWithAvailability;
  date: string;
}>();

const emit = defineEmits<{
  close: [];
  created: [];
}>();

const bookingsStore = useBookingsStore();

const startTime = ref("09:00");
const endTime = ref("10:00");
const isSubmitting = ref(false);
const error = ref("");

const formattedDate = computed(() =>
  new Date(`${props.date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }),
);

async function handleSubmit() {
  error.value = "";

  if (startTime.value >= endTime.value) {
    error.value = "End time must be after start time.";
    return;
  }

  isSubmitting.value = true;
  try {
    await bookingsStore.createBooking({
      roomId: props.room.id,
      startAt: `${props.date}T${startTime.value}:00`,
      endAt: `${props.date}T${endTime.value}:00`,
    });
    emit("created");
  } catch (e: unknown) {
    const err = e as { data?: { code?: string; message?: string } };
    error.value =
      err?.data?.code === "BOOKING_CONFLICT"
        ? "This room is already booked for part of the selected time. Please choose a different slot."
        : (err?.data?.message ?? "Something went wrong. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm"
      aria-hidden="true"
      @click="emit('close')"
    />

    <!-- Dialog panel -->
    <div
      class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      :aria-label="`Book ${room.name}`"
    >
      <div
        class="pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-stone-200"
        @click.stop
      >
        <!-- Header -->
        <div
          class="flex items-start justify-between border-b border-stone-100 px-6 pt-6 pb-4"
        >
          <div>
            <h2 class="text-lg font-semibold text-stone-900">
              Book {{ room.name }}
            </h2>
            <p class="mt-0.5 text-sm text-stone-500">{{ formattedDate }}</p>
          </div>
          <button
            type="button"
            class="-mt-1 -mr-1 rounded-lg p-1 text-stone-400 transition-colors hover:text-stone-700"
            aria-label="Close dialog"
            @click="emit('close')"
          >
            <UIcon name="i-heroicons-x-mark" class="h-5 w-5" />
          </button>
        </div>

        <!-- Room info summary -->
        <div
          class="mx-6 mt-5 flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50 px-4 py-3 text-sm"
        >
          <UIcon
            name="i-heroicons-building-office-2"
            class="h-4 w-4 shrink-0 text-stone-400"
          />
          <span class="text-stone-600">{{ room.location }}</span>
          <span class="text-stone-200">·</span>
          <UIcon
            name="i-heroicons-users"
            class="h-4 w-4 shrink-0 text-stone-400"
          />
          <span class="text-stone-600">{{ room.capacity }} people</span>
        </div>

        <!-- Form -->
        <form class="space-y-5 px-6 pt-5 pb-6" @submit.prevent="handleSubmit">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                for="start-time"
                class="mb-1.5 block text-sm font-medium text-stone-700"
              >
                Start time
              </label>
              <UInput
                id="start-time"
                v-model="startTime"
                type="time"
                required
                class="w-full"
              />
            </div>
            <div>
              <label
                for="end-time"
                class="mb-1.5 block text-sm font-medium text-stone-700"
              >
                End time
              </label>
              <UInput
                id="end-time"
                v-model="endTime"
                type="time"
                required
                class="w-full"
              />
            </div>
          </div>

          <!-- Error message -->
          <Transition name="slide-fade">
            <p
              v-if="error"
              class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {{ error }}
            </p>
          </Transition>

          <!-- Actions -->
          <div class="flex gap-3 pt-1">
            <UButton
              type="button"
              variant="ghost"
              color="neutral"
              class="flex-1 justify-center"
              @click="emit('close')"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              color="primary"
              class="flex-1 justify-center"
              :loading="isSubmitting"
            >
              Confirm booking
            </UButton>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.slide-fade-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.slide-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
