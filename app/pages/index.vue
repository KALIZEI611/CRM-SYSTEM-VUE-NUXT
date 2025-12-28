<script setup lang="ts">
import { ref } from "vue";
import type { ICard, IColumn } from "~/components/kanban/kanban.types";
import { useSeoMeta } from "nuxt/app";
import { useKanbarQuery } from "~/components/kanban/useKanbanQuery";
import { convertCurrency } from "@/Util/convertCurrency";
import dayjs from "dayjs";
import CreateDeal from "./CreateDeal.vue";
import type { EnumStatus } from "~/types/dealt.types";
import { generateColumnStyle } from "~/components/kanban/generate-gradient";
import { useDealSlideStore } from "~/stores/deal-slide.store";

useSeoMeta({
  title: "Главная",
});

const { data, isLoading, refetch } = useKanbarQuery();
const store = useDealSlideStore();
</script>

<template>
  <div class="p-10">
    <h1 class="font-bold text-2xl mb-10">СРМ система Михея</h1>
    <div v-if="isLoading">Загрузка...</div>
    <div v-else>
      <div class="grid grid-cols-5 gap-16">
        <div v-for="(column, index) in data" :key="column.id" class="min-h-screen">
          <div
            class="rounded bg-slate-700 py-1 px-5 mb-2 text-center"
            :style="generateColumnStyle(index, data?.length)"
          >
            {{ column.name }}
          </div>
          <div>
            <CreateDeal :refetch="refetch" :status="column.id" />
            <ui-card
              v-for="card in column.items"
              :key="card.id"
              class="mb-5"
              draggable="true"
            >
              <ui-card-header role="button" class="color" @click="store.set(card)">
                <ui-card-title>{{ card.name }}</ui-card-title>
                <ui-card-description>
                  {{ convertCurrency(card.price) }}
                </ui-card-description>
              </ui-card-header>
              <ui-card-content class="color text-xs pb-2">
                <div>Компания</div>
                {{ card.companyName }}
              </ui-card-content>
              <ui-card-footer class="color">
                {{ dayjs(card.$createdAt).format("DD MMMM YYYY") }}
              </ui-card-footer>
            </ui-card>
          </div>
        </div>
      </div>
    </div>
    <KanbanSlideover />
  </div>
</template>

<style scoped>
.color {
  color: white;
}
</style>
