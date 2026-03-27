<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "~/stores/auth";
const authStore = useAuthStore();

const navLinks = [
  { label: "Dashboard", to: "/", icon: "i-heroicons-home" },
  { label: "My Bookings", to: "/bookings", icon: "i-heroicons-calendar-days" },
];

const adminLinks = [
  { label: "Rooms", to: "/admin/rooms", icon: "i-heroicons-building-office-2" },
];

const userInitials = computed(() => {
  const name = authStore.user?.fullName ?? "";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
});
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur-md"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between gap-4">
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="font-brand shrink-0 text-xl text-stone-900 select-none"
        >
          RoomBooker
        </NuxtLink>

        <!-- Primary nav -->
        <nav class="hidden flex-1 items-center gap-0.5 md:flex">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
            active-class="!text-stone-900 bg-stone-100"
            :exact="link.to === '/'"
          >
            <UIcon :name="link.icon" class="h-4 w-4" />
            {{ link.label }}
          </NuxtLink>

          <!-- Admin section -->
          <template v-if="authStore.isAdmin">
            <div class="mx-2 h-4 w-px bg-stone-200" />
            <NuxtLink
              v-for="link in adminLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
              active-class="!text-stone-900 bg-stone-100"
            >
              <UIcon :name="link.icon" class="h-4 w-4" />
              {{ link.label }}
            </NuxtLink>
          </template>
        </nav>

        <!-- User info + logout -->
        <div class="flex shrink-0 items-center gap-3">
          <div
            v-if="authStore.user"
            class="hidden items-center gap-2.5 md:flex"
          >
            <div
              class="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 select-none"
            >
              {{ userInitials }}
            </div>
            <div class="text-sm leading-tight">
              <p class="font-medium text-stone-900">
                {{ authStore.user.fullName }}
              </p>
              <p class="text-xs text-stone-400 capitalize">
                {{ authStore.user.role.toLowerCase() }}
              </p>
            </div>
          </div>

          <UButton
            variant="ghost"
            color="neutral"
            size="sm"
            leading-icon="i-heroicons-arrow-right-on-rectangle"
            @click="authStore.logout"
          >
            <span class="hidden sm:inline">Sign out</span>
          </UButton>
        </div>
      </div>
    </div>
  </header>
</template>
