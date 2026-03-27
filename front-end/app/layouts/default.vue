<template>
  <div class="flex min-h-screen flex-col bg-stone-50">
    <AppHeader />
    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>
