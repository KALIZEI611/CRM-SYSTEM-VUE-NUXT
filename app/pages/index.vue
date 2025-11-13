<script setup lang="ts">
import { ref } from "vue";
import type { ICard, IColumn } from "@/kanban/kanban.types";
import { useSeoMeta } from "nuxt/app";
import { useKanbarQuery } from "@/kanban/useKanbanQuery";

useSeoMeta({
  title: "Главная",
});

const dragCard = ref<ICard | null>(null);
const sourceColumn = ref<IColumn | null>(null);
useKanbarQuery();
</script>

<template>
  <div class="p-10">
    <h1 class="font-bold text-2xl mb-10">СРМ система Михея</h1>
    <div>
      <ui-card class="mb-3" draggable="true">
        <ui-card-header role="button" class="color">
          Название карточки
        </ui-card-header>
        <ui-card-content class="color"> Компания </ui-card-content>
        <ui-card-footer class="color"> Дата </ui-card-footer>
      </ui-card>
    </div>
  </div>
</template>

<style scoped>
.color {
  color: white;
}
</style>
