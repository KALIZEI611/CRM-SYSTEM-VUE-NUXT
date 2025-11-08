<script lang="ts" setup>
import { MENU_DATA } from "./menu.date";
</script>

<template>
  <div>
    <NuxtLink
      class="flex items-center py-1 px-3 rounded-lg w-full hover:bg-gray-700 hover:shadow transition-all mb-2.5 text-xl"
      v-for="item in MENU_DATA"
      :key="item.name"
      :to="item.url"
    >
      <span>{{ item.name }}</span>
    </NuxtLink>
  </div>
</template>
