<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { useHead, useRouter } from "#app";
import { useAuthStore } from "~/stores/auth";
import { definePageMeta } from "#imports";

definePageMeta({ layout: "auth" });
useHead({ title: "Sign In – RoomBooker" });

const authStore = useAuthStore();
const router = useRouter();

// Redirect already-authenticated users away from the login page
if (import.meta.client && authStore.isAuthenticated) {
  await router.replace("/");
}

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const error = ref("");
const fieldErrors = ref<Partial<Record<"email" | "password", string[]>>>({});

async function handleLogin() {
  error.value = "";
  fieldErrors.value = {};

  const result = loginSchema.safeParse({
    email: email.value,
    password: password.value,
  });
  if (!result.success) {
    fieldErrors.value = result.error.flatten().fieldErrors;
    return;
  }

  isLoading.value = true;
  try {
    await authStore.login(email.value, password.value);
    await router.push("/");
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } };
    error.value = err?.data?.message ?? "Invalid email or password.";
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="w-full max-w-sm">
    <!-- Brand -->
    <div class="mb-10 text-center select-none">
      <h1 class="font-brand text-4xl tracking-tight text-stone-900">
        RoomBooker
      </h1>
      <p class="mt-2 text-sm text-stone-500">
        Sign in to reserve your meeting space
      </p>
    </div>

    <!-- Card -->
    <div
      class="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm shadow-stone-100"
    >
      <form class="space-y-5" novalidate @submit.prevent="handleLogin">
        <div>
          <label
            for="email"
            class="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Email
          </label>
          <UInput
            id="email"
            v-model="email"
            type="email"
            placeholder="you@company.com"
            autocomplete="email"
            class="w-full"
          />
          <p
            v-if="fieldErrors.email?.[0]"
            class="mt-1 text-xs text-red-500"
            role="alert"
          >
            {{ fieldErrors.email[0] }}
          </p>
        </div>

        <div>
          <label
            for="password"
            class="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Password
          </label>
          <UInput
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            class="w-full"
          />
          <p
            v-if="fieldErrors.password?.[0]"
            class="mt-1 text-xs text-red-500"
            role="alert"
          >
            {{ fieldErrors.password[0] }}
          </p>
        </div>

        <Transition name="fade">
          <p
            v-if="error"
            class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {{ error }}
          </p>
        </Transition>

        <UButton
          type="submit"
          color="primary"
          class="w-full justify-center"
          :loading="isLoading"
        >
          Sign in
        </UButton>
      </form>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
