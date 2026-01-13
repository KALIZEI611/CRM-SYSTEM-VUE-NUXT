<script setup lang="ts">
import { account } from "~/Util/appwrite";
import { useRouter } from "vue-router";
import { useIsLoadingStore, useAuthStore } from "~/stores/auth.store";
import { onMounted, ref } from "vue";

const isLoadingStore = useIsLoadingStore();
const store = useAuthStore();
const router = useRouter();
const authCheckCompleted = ref(false);

const publicRoutes = ["/login", "/register"];

onMounted(async () => {
  if (authCheckCompleted.value || store.authChecked) {
    isLoadingStore.set(false);
    return;
  }

  const currentPath = router.currentRoute.value.path;

  if (publicRoutes.includes(currentPath)) {
    isLoadingStore.set(false);
    store.setAuthChecked(true);
    return;
  }

  try {
    const user = await account.get();
    if (user) {
      store.set(user);
    }
    store.setAuthChecked(true);
  } catch (error: any) {
    store.setAuthChecked(true);

    if (error.code === 401 && !publicRoutes.includes(currentPath)) {
      await router.push("/login");
    }
  } finally {
    isLoadingStore.set(false);
    authCheckCompleted.value = true;
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
