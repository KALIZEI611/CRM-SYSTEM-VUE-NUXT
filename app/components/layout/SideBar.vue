<script setup lang="ts">
import { useRouter } from "vue-router";
import { useIsLoadingStore, useAuthStore } from "~/stores/auth.store";
import { account } from "~/Util/appwrite";

const isLoadingStore = useIsLoadingStore();
const store = useAuthStore();
const router = useRouter();

const logout = async () => {
  isLoadingStore.set(true);
  await account.deleteSession("current");
  store.clear();
  await router.push("/login");
  isLoadingStore.set(false);
};
</script>

<template>
  <div class="flex h-full">
    <aside class="px-5 py-8 bg-sidebar h-full relative w-full">
      <NuxtLink to="/" class="mb-10 block">
        <NuxtImg src="/logo.svg" alt="" width="140" class="mx-auto" />
      </NuxtLink>
      <button
        @click="logout"
        class="absolute top-2 right-3 transition-colors hover:text-purple-400"
      >
        <Icon name="line-md:logout" size="20" />
      </button>
      <LayoutMenu />
    </aside>
  </div>
</template>
