<template>
  <div class="wrapper">
    <NuxtImg src="/loader.svg" alt="" width="200" />
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.wrapper {
  @apply bg-gray-800 flex items-center justify-center w-screen h-screen;
}
</style>
