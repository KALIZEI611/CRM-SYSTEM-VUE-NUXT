<script setup lang="ts">
import { useSeoMeta } from "nuxt/app";
import { useKanbarQuery } from "~/components/kanban/useKanbanQuery";
import { convertCurrency } from "@/Util/convertCurrency";
import dayjs from "dayjs";
import CreateDeal from "./CreateDeal.vue";
import { generateColumnStyle } from "~/components/kanban/generate-gradient";
import { useDealSlideStore } from "~/stores/deal-slide.store";
import { computed } from "vue";

useSeoMeta({
  title: "Главная",
});

const { data, isLoading, refetch } = useKanbarQuery();
const store = useDealSlideStore();

// Статистика
const totalStats = computed(() => {
  if (!data.value) return { totalDeals: 0, totalAmount: 0 };

  let totalDeals = 0;
  let totalAmount = 0;

  data.value.forEach((column) => {
    totalDeals += column.items?.length || 0;
    totalAmount +=
      column.items?.reduce((sum, item) => sum + (item.price || 0), 0) || 0;
  });

  return { totalDeals, totalAmount };
});

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const statusLabels: Record<string, string> = {
  todo: "Новые",
  "to-be-agreed": "На согласовании",
  "in-progress": "В работе",
  produced: "Произведено",
  done: "Выполнено",
};

const statusColors: Record<string, string> = {
  todo: "bg-gray-500/20 text-gray-500",
  "to-be-agreed": "bg-blue-500/20 text-blue-500",
  "in-progress": "bg-yellow-500/20 text-yellow-500",
  produced: "bg-purple-500/20 text-purple-500",
  done: "bg-green-500/20 text-green-500",
};

// Генерация ширины прогресс-бара
const getProgressWidth = (column: any) => {
  if (!column.items?.length) return "0%";

  // Рассчитываем процент от общего количества сделок
  const totalDeals =
    data.value?.reduce((sum, col) => sum + (col.items?.length || 0), 0) || 0;
  if (totalDeals === 0) return "0%";

  const percentage = (column.items.length / totalDeals) * 100;
  return `${percentage}%`;
};
</script>

<template>
  <div class="min-h-screen bg-background text-foreground p-4">
    <div class="max-w-8xl mx-auto">
      <!-- Заголовок -->
      <div class="mb-8">
        <div
          class="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
              CRM система
            </h1>
            <p class="text-muted-foreground">
              Управление сделками и воронкой продаж
            </p>
          </div>
        </div>
      </div>

      <!-- Загрузка -->
      <div
        v-if="isLoading"
        class="bg-card border border-border rounded-xl p-12 text-center"
      >
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"
        ></div>
        <p class="text-muted-foreground">Загрузка сделок...</p>
      </div>

      <!-- Канбан доска -->
      <div v-else class="space-y-6">
        <!-- Фильтры и поиск -->
        <div class="bg-card border border-border rounded-xl p-4">
          <div
            class="flex flex-col md:flex-row gap-4 items-center justify-between"
          >
            <div class="flex-1">
              <input
                type="text"
                placeholder="Поиск по названию или компании..."
                class="w-full px-4 py-3 bg-background border border-input rounded-lg text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div class="flex gap-2">
              <button
                @click="refetch"
                class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Обновить
              </button>
              <button
                class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Новая сделка
              </button>
            </div>
          </div>
        </div>

        <!-- Канбан колонки -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div
            v-for="(column, index) in data"
            :key="column.id"
            class="space-y-4"
          >
            <!-- Заголовок колонки -->
            <div class="bg-card border border-border rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-lg font-semibold text-white">
                  {{ statusLabels[column.id] || column.name }}
                </h3>
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium',
                    statusColors[column.id],
                  ]"
                >
                  {{ column.items?.length || 0 }}
                </span>
              </div>
            </div>

            <!-- Карточки сделок -->
            <div class="space-y-3">
              <CreateDeal :refetch="refetch" :status="column.id" />

              <div
                v-for="card in column.items"
                :key="card.id"
                class="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group"
                @click="store.set(card)"
              >
                <!-- Заголовок карточки -->
                <div
                  class="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10"
                >
                  <div class="flex items-start justify-between gap-2">
                    <h4 class="font-semibold text-white truncate">
                      {{ card.name }}
                    </h4>
                    <span
                      :class="[
                        'px-2 py-1 rounded-md text-xs font-medium',
                        statusColors[column.id],
                      ]"
                    >
                      {{ statusLabels[column.id] || column.id }}
                    </span>
                  </div>
                </div>

                <!-- Содержимое карточки -->
                <div class="p-4">
                  <!-- Сумма -->
                  <div class="mb-4">
                    <p class="text-sm text-muted-foreground mb-1">Сумма</p>
                    <p class="text-2xl font-bold text-white">
                      {{ formatCurrency(card.price) }}
                    </p>
                  </div>

                  <!-- Компания -->
                  <div class="mb-4">
                    <p class="text-sm text-muted-foreground mb-1">Компания</p>
                    <p class="text-white font-medium truncate">
                      {{ card.companyName || "Не указано" }}
                    </p>
                  </div>

                  <!-- Дата -->
                  <div class="flex items-center justify-between text-sm">
                    <div class="text-muted-foreground">
                      {{ dayjs(card.$createdAt).format("DD.MM.YYYY") }}
                    </div>
                    <div
                      class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <button class="text-primary hover:text-primary/80">
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Пустая колонка -->
              <div
                v-if="!column.items?.length"
                class="bg-card/50 border border-dashed border-border rounded-xl p-8 text-center"
              >
                <div class="text-4xl mb-4 opacity-50">📭</div>
                <p class="text-muted-foreground">Здесь пока нет сделок</p>
                <p class="text-sm text-muted-foreground mt-1">
                  Добавьте первую сделку
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Итоговая статистика -->
        <div class="bg-card border border-border rounded-xl p-6">
          <h3 class="text-lg font-semibold text-white mb-4">
            Распределение сделок по статусам
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div
              v-for="(column, index) in data"
              :key="column.id"
              class="border border-border rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm text-muted-foreground truncate">
                  {{ statusLabels[column.id] || column.name }}
                </p>
                <span class="text-lg font-bold text-white">{{
                  column.items?.length || 0
                }}</span>
              </div>
              <div class="h-2 bg-input rounded-full overflow-hidden mb-2">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :style="{
                    width: getProgressWidth(column),
                    background: `linear-gradient(135deg, 
                      hsl(${(360 / (data?.length || 1)) * index}, 70%, 60%), 
                      hsl(${
                        (360 / (data?.length || 1)) * index + 20
                      }, 70%, 50%))`,
                  }"
                ></div>
              </div>
              <div class="text-sm">
                <span class="text-muted-foreground">Сумма:</span>
                <span class="text-white font-medium ml-2">
                  {{
                    formatCurrency(
                      column.items?.reduce(
                        (sum, item) => sum + (item.price || 0),
                        0
                      ) || 0
                    )
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Слайдер сделки -->
    <KanbanSlideover />
  </div>
</template>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Анимация для карточек */
.group:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.1);
  transition: all 0.3s ease;
}

/* Плавные переходы для прогресс-баров */
.h-full {
  transition: width 0.5s ease-in-out;
}
</style>
