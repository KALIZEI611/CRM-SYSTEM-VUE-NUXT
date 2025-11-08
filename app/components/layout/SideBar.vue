<script setup lang="ts">
const iconProps = {
  name: "line-md:log-out",
};
</script>

<template>
  <aside class="px-5 py-8 bg-sidebar h-full relative w-full">
    <NuxtLink to="/" class="mb-10 block">
      <NuxtImg src="/logo.svg" alt="" width="140" class="mx-auto" />
    </NuxtLink>
    <button
      class="absolute top-2 right-3 transition-colors hover:text-purple-400"
    >
      Выход
    </button>
    <LayoutMenu />
  </aside>
</template>
