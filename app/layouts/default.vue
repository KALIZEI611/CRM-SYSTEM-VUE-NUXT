<script setup lang="ts">
import { account } from "~/Util/appwrite";
import { useRouter } from "vue-router";
import { useIsLoadingStore, useAuthStore } from "~/stores/auth.store";
import { onMounted } from "vue";

const isLoadingStore = useIsLoadingStore();
const store = useAuthStore();
const router = useRouter();

onMounted(async () => {
  try {
    const user = await account.get();
    if (user) store.set(user);
  } catch (e) {
    router.push("/login");
  } finally {
    isLoadingStore.set(false);
  }
});
</script>

<template>
  <LayoutLoader v-if="isLoadingStore.isLoading" />
  <section v-else :class="{ grid: store.isAuth }" style="min-height: 100vh">
    <LayoutSideBar v-if="store.isAuth" />
    <div>
      <slot />
    </div>
  </section>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 6fr;
}
</style>
