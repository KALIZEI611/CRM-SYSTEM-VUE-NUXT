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
</script>

<template>
  <div>
    <USlideover v-model="isLocalOpen">
      <UCard
        class="flex flex-col flex-1 overflow-y-auto"
        :ui="{
          body: 'p-0 flex-1',
        }"
      >
        <template #header>
          <div>
            <KanbanSlideoverTop />
          </div>
        </template>
        <KanbanSlideoverComments />
      </UCard>
    </USlideover>
  </div>
</template>
