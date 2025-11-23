<script lang="ts" setup>
import { computed } from "vue";
import { useDealSlideStore } from "~/stores/deal-slide.store";

const store = useDealSlideStore();

const isLocalOpen = computed({
  get: () => store.isOpen,
  set: (value) => {
    store.isOpen = value;
  },
});

const showOverlay = computed(() => isLocalOpen.value);
</script>

<template>
  <div>
    <Transition name="fade">
      <div
        v-if="showOverlay"
        class="fixed inset-0 z-50 bg-gray-900/60 transition-opacity duration-300"
        @click="isLocalOpen = false"
      />
    </Transition>

    <Transition name="slide">
      <div
        v-if="isLocalOpen"
        class="fixed inset-y-0 right-0 z-50 w-full max-w-sm h-full"
        @click.stop
      >
        <UCard
          class="flex flex-col flex-1 overflow-y-auto h-full border-0 shadow-none ring-0 bg-slate-700"
          :ui="{
            body: { base: 'flex-1' },
            ring: 'ring-0',
            rounded: 'rounded-none',
            divide: 'divide-y divide-border',
          }"
        >
          <template #header>
            <KanbanSlideoverTop />
          </template>

          <KanbanSlideoverComments />
        </UCard>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
