<script setup lang="ts">
import dayjs from "dayjs";
import { useDealSlideStore } from "~/stores/deal-slide.store";
import { convertCurrency } from "~/Util/convertCurrency";

const store = useDealSlideStore();
</script>

<template>
  <div class="border-border bg-black/50 rounded p-3">
    <div class="text-xl uppercase bold mb-4">О сделке</div>
    <kanban-slideover-label label-text="Наименование">
      <h2>
        {{ store.card?.name }}
      </h2>
    </kanban-slideover-label>
    <kanban-slideover-label label-text="Сумма">
      {{ convertCurrency(store.card?.price || 0) }}
    </kanban-slideover-label>

    <kanban-slideover-label label-text="Статус">
      <UiBadge variant="outline">
        {{ store.card?.status }}
      </UiBadge>
    </kanban-slideover-label>

    <kanban-slideover-label label-text="Клиент">
      {{ dayjs(store.card?.companyName).format("DD MMMM YYYY") }}
    </kanban-slideover-label>
  </div>
</template>
