<script setup lang="ts">
import { definePageMeta } from "#imports";
import { useAsyncData } from "#app";
import { ref } from "vue";
import { z } from "zod";
import { useRoomsStore } from "~/stores/rooms";
import type { Room } from "~/types";

definePageMeta({ middleware: ["auth", "admin"] });

const roomsStore = useRoomsStore();

const {
  data: allRooms,
  pending: isAdminLoading,
  refresh,
} = await useAsyncData("admin-rooms", () => roomsStore.fetchAllRooms(), {
  server: false,
  default: () => [] as Room[],
});

const roomSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  location: z.string().trim().min(1, "Location is required"),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
});

// ── Room form modal ───────────────────────────────────────────────────────────
const isModalOpen = ref(false);
const editingRoom = ref<Room | null>(null);
const isSubmitting = ref(false);
const formErrors = ref<
  Partial<Record<"name" | "location" | "capacity", string[]>>
>({});
const formServerError = ref("");
const formName = ref("");
const formLocation = ref("");
const formCapacity = ref(1);

function openAdd() {
  editingRoom.value = null;
  formName.value = "";
  formLocation.value = "";
  formCapacity.value = 1;
  formErrors.value = {};
  formServerError.value = "";
  isModalOpen.value = true;
}

function openEdit(room: Room) {
  editingRoom.value = room;
  formName.value = room.name;
  formLocation.value = room.location;
  formCapacity.value = room.capacity;
  formErrors.value = {};
  formServerError.value = "";
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

async function submitForm() {
  formErrors.value = {};
  formServerError.value = "";

  const result = roomSchema.safeParse({
    name: formName.value,
    location: formLocation.value,
    capacity: formCapacity.value,
  });
  if (!result.success) {
    formErrors.value = result.error.flatten().fieldErrors;
    return;
  }

  isSubmitting.value = true;
  try {
    if (editingRoom.value) {
      await roomsStore.updateRoom(editingRoom.value.id, result.data);
    } else {
      await roomsStore.createRoom(result.data);
    }
    await refresh();
    closeModal();
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } };
    formServerError.value =
      err?.data?.message ?? "Something went wrong. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
}

async function toggleActive(room: Room) {
  try {
    await roomsStore.toggleActive(room);
    await refresh();
  } catch {
    // silently ignore — row will stay as-is
  }
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="mb-6 flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-stone-900">Room Management</h1>
        <p class="mt-1 text-sm text-stone-500">
          Add, edit, and manage meeting room availability
        </p>
      </div>
      <UButton color="primary" leading-icon="i-heroicons-plus" @click="openAdd">
        Add room
      </UButton>
    </div>

    <!-- Rooms table -->
    <div class="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <!-- Table head -->
      <div
        class="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b border-stone-100 bg-stone-50 px-6 py-3"
      >
        <span
          class="text-xs font-semibold tracking-wide text-stone-500 uppercase"
          >Room</span
        >
        <span
          class="text-xs font-semibold tracking-wide text-stone-500 uppercase"
          >Location</span
        >
        <span
          class="text-xs font-semibold tracking-wide text-stone-500 uppercase"
          >Capacity</span
        >
        <span
          class="text-xs font-semibold tracking-wide text-stone-500 uppercase"
          >Status</span
        >
        <span class="sr-only">Actions</span>
      </div>

      <!-- Loading skeleton -->
      <div v-if="isAdminLoading" class="divide-y divide-stone-100">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-6 py-4">
          <div class="h-4 flex-1 animate-pulse rounded bg-stone-100" />
          <div class="h-4 w-24 animate-pulse rounded bg-stone-100" />
          <div class="h-4 w-12 animate-pulse rounded bg-stone-100" />
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="allRooms.length === 0" class="px-6 py-16 text-center">
        <UIcon
          name="i-heroicons-building-office-2"
          class="mx-auto mb-3 h-10 w-10 text-stone-300"
        />
        <p class="text-sm text-stone-500">
          No rooms yet. Add one to get started.
        </p>
      </div>

      <!-- Room rows -->
      <div v-else class="divide-y divide-stone-100">
        <div
          v-for="room in allRooms"
          :key="room.id"
          class="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-stone-50"
        >
          <span class="text-sm font-medium text-stone-900">{{
            room.name
          }}</span>
          <span class="text-sm text-stone-500">{{ room.location }}</span>
          <span class="text-sm text-stone-500">{{ room.capacity }} people</span>
          <LazyUBadge
            :color="room.isActive ? 'success' : 'neutral'"
            variant="subtle"
            size="sm"
          >
            {{ room.isActive ? "Active" : "Inactive" }}
          </LazyUBadge>
          <div class="flex items-center gap-2">
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
              icon="i-heroicons-pencil"
              @click="openEdit(room)"
            >
              Edit
            </UButton>
            <UButton
              variant="ghost"
              :color="room.isActive ? 'error' : 'success'"
              size="xs"
              :icon="
                room.isActive
                  ? 'i-heroicons-archive-box'
                  : 'i-heroicons-arrow-path'
              "
              @click="toggleActive(room)"
            >
              {{ room.isActive ? "Deactivate" : "Activate" }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Add / Edit room modal -->
    <Teleport v-if="isModalOpen" to="body">
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm"
        aria-hidden="true"
        @click="closeModal"
      />

      <!-- Dialog panel -->
      <div
        class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-label="editingRoom ? `Edit ${editingRoom.name}` : 'Add room'"
      >
        <div
          class="pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-stone-200"
          @click.stop
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between border-b border-stone-100 px-6 pt-6 pb-4"
          >
            <h2 class="text-lg font-semibold text-stone-900">
              {{ editingRoom ? "Edit room" : "Add room" }}
            </h2>
            <button
              type="button"
              class="-mr-1 rounded-lg p-1 text-stone-400 transition-colors hover:text-stone-700"
              aria-label="Close dialog"
              @click="closeModal"
            >
              <UIcon name="i-heroicons-x-mark" class="h-5 w-5" />
            </button>
          </div>

          <!-- Form -->
          <form class="space-y-4 px-6 pt-5 pb-6" @submit.prevent="submitForm">
            <!-- Name -->
            <div class="space-y-1.5">
              <label for="room-name" class="text-sm font-medium text-stone-700">
                Room name
              </label>
              <input
                id="room-name"
                v-model="formName"
                type="text"
                placeholder="e.g. Everest"
                class="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 transition placeholder:text-stone-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p
                v-if="formErrors.name?.[0]"
                class="text-xs text-red-500"
                role="alert"
              >
                {{ formErrors.name[0] }}
              </p>
            </div>

            <!-- Location -->
            <div class="space-y-1.5">
              <label
                for="room-location"
                class="text-sm font-medium text-stone-700"
              >
                Location
              </label>
              <input
                id="room-location"
                v-model="formLocation"
                type="text"
                placeholder="e.g. 3rd Floor, East Wing"
                class="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 transition placeholder:text-stone-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p
                v-if="formErrors.location?.[0]"
                class="text-xs text-red-500"
                role="alert"
              >
                {{ formErrors.location[0] }}
              </p>
            </div>

            <!-- Capacity -->
            <div class="space-y-1.5">
              <label
                for="room-capacity"
                class="text-sm font-medium text-stone-700"
              >
                Capacity
              </label>
              <input
                id="room-capacity"
                v-model.number="formCapacity"
                type="number"
                min="1"
                placeholder="e.g. 10"
                class="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 transition placeholder:text-stone-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p
                v-if="formErrors.capacity?.[0]"
                class="text-xs text-red-500"
                role="alert"
              >
                {{ formErrors.capacity[0] }}
              </p>
            </div>

            <!-- Server error -->
            <p v-if="formServerError" class="text-sm text-red-500" role="alert">
              {{ formServerError }}
            </p>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 pt-2">
              <UButton
                type="button"
                variant="ghost"
                color="neutral"
                @click="closeModal"
              >
                Cancel
              </UButton>
              <UButton type="submit" color="primary" :loading="isSubmitting">
                {{ editingRoom ? "Save changes" : "Add room" }}
              </UButton>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
