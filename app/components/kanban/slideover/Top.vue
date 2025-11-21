<script setup lang="ts">
import dayjs from "dayjs";
import { useDealSlideStore } from "~/stores/deal-slide.store";
import { convertCurrency } from "~/Util/convertCurrency";

const store = useDealSlideStore();
</script>
<template>
  <div class="border-border bg-black/20 rounded p-3">
    <div class="uppercase bold text-xl mb-4">О сделке</div>
    <KanbanSlideoverLabel label-text="Наименование" class="ml-2 mr-2">
      <h2>
        {{ store.card?.name }}
      </h2>
    </KanbanSlideoverLabel>
    <KanbanSlideoverLabel label-text="Сумма" class="ml-2 mr-2">
      {{ convertCurrency(store.card?.price || 0) }}
    </KanbanSlideoverLabel>
    <KanbanSlideoverLabel label-text="Статус" class="ml-2 mr-2">
      <UiBadge variant="outline">
        {{ store.card?.status }}
      </UiBadge>
    </KanbanSlideoverLabel>
    <KanbanSlideoverLabel label-text="Клиент" class="ml-2 mr-2">
      {{ store.card?.companyName }}
    </KanbanSlideoverLabel>
    <KanbanSlideoverLabel label-text="Дата создания" class="ml-2 mr-2">
      {{ dayjs(store.card?.$createdAt).format("DD MMMM YYYY") }}
    </KanbanSlideoverLabel>
  </div>
</template>
