<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import { useRoute, useSeoMeta } from "nuxt/app";
import {
  COLLECTION_CUSTOMERS,
  COLLECTION_DEALS,
  DB_ID,
} from "~/constants/app.constants";
import { DB } from "~/Util/appwrite";
import { Query } from "appwrite";
import { computed } from "vue";

const route = useRoute();
const customerId = route.params.id as string;

interface ICustomer {
  $id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  from_source?: string;
  company?: string;
  address?: string;
  notes?: string;
  $createdAt: string;
  $updatedAt: string;
}

interface IDeal {
  $id: string;
  name: string;
  price: number;
  status: string;
  customer: string;
  description?: string;
  paymentMethod?: string;
  quantity?: number;
  $createdAt: string;
  $updatedAt: string;
}

const { data: customerData, isLoading: isCustomerLoading } = useQuery({
  queryKey: ["customer", customerId],
  queryFn: async () => {
    // Получаем данные клиента
    const customer = await DB.getDocument(
      DB_ID,
      COLLECTION_CUSTOMERS,
      customerId
    );
    return customer as unknown as ICustomer;
  },
});

const { data: dealsData, isLoading: isDealsLoading } = useQuery({
  queryKey: ["customer-deals", customerId],
  queryFn: async () => {
    // Получаем сделки клиента
    const deals = await DB.listDocuments(DB_ID, COLLECTION_DEALS, [
      Query.equal("customer", customerId),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);
    return deals.documents as unknown as IDeal[];
  },
});

// Статистика
const stats = computed(() => {
  if (!dealsData.value) return null;

  const deals = dealsData.value;
  const totalAmount = deals.reduce((sum, deal) => sum + (deal.price || 0), 0);
  const activeDeals = deals.filter((deal) =>
    ["todo", "to-be-agreed", "in-progress", "produced"].includes(deal.status)
  ).length;
  const completedDeals = deals.filter((deal) => deal.status === "done").length;
  const lastDeal = deals[0];

  return {
    totalDeals: deals.length,
    totalAmount,
    activeDeals,
    completedDeals,
    lastDealDate: lastDeal?.$createdAt,
    avgDealAmount: deals.length ? totalAmount / deals.length : 0,
  };
});

const pageTitle = computed(() => {
  return customerData.value
    ? `Клиент: ${customerData.value.name}`
    : "Просмотр клиента";
});

useSeoMeta({
  title: pageTitle,
});

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    todo: "Новая",
    "to-be-agreed": "На согласовании",
    "in-progress": "В работе",
    produced: "Произведено",
    done: "Выполнено",
  };
  return statusMap[status] || status;
};

const getStatusClass = (status: string) => {
  const statusClasses: Record<string, string> = {
    todo: "bg-gray-500/20 text-gray-500",
    "to-be-agreed": "bg-blue-500/20 text-blue-500",
    "in-progress": "bg-yellow-500/20 text-yellow-500",
    produced: "bg-purple-500/20 text-purple-500",
    done: "bg-green-500/20 text-green-500",
  };
  return statusClasses[status] || "bg-gray-500/20 text-gray-500";
};
</script>

<template>
  <div class="min-h-screen bg-background text-foreground p-4">
    <div class="max-w-8xl mx-auto">
      <!-- Кнопка назад -->
      <div class="mb-6">
        <button
          @click="$router.push('/customers')"
          class="px-4 py-2 border border-input rounded-lg hover:bg-input transition-colors flex items-center gap-2"
        >
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Назад к списку
        </button>
      </div>

      <!-- Заголовок -->
      <div class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
          {{ pageTitle }}
        </h1>
        <p class="text-muted-foreground">Детальная информация о клиенте</p>
      </div>

      <!-- Загрузка -->
      <div v-if="isCustomerLoading" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"
        ></div>
        <p class="text-muted-foreground">Загрузка данных клиента...</p>
      </div>

      <!-- Основной контент -->
      <div v-else-if="customerData" class="space-y-8">
        <!-- Карточка клиента -->
        <div class="bg-card border border-border rounded-xl overflow-hidden">
          <div
            class="px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10"
          >
            <h2 class="text-xl font-semibold text-white">
              Информация о клиенте
            </h2>
          </div>

          <div class="p-6">
            <div class="flex flex-col lg:flex-row gap-8">
              <!-- Аватар и основная информация -->
              <div class="lg:w-1/3">
                <div class="flex flex-col items-center lg:items-start">
                  <!-- Аватар -->
                  <div
                    class="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden mb-6"
                  >
                    <img
                      v-if="customerData.avatar_url"
                      :src="customerData.avatar_url"
                      :alt="customerData.name"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-primary font-bold text-4xl">
                      {{ customerData.name.charAt(0).toUpperCase() }}
                    </span>
                  </div>

                  <!-- Основная информация -->
                  <div class="space-y-4">
                    <div>
                      <h3 class="text-2xl font-bold text-white mb-2">
                        {{ customerData.name }}
                      </h3>
                      <p
                        v-if="customerData.company"
                        class="text-lg text-muted-foreground"
                      >
                        {{ customerData.company }}
                      </p>
                    </div>

                    <div v-if="customerData.from_source" class="inline-block">
                      <span
                        class="px-3 py-1 bg-input text-muted-foreground rounded-md text-sm"
                      >
                        Источник: {{ customerData.from_source }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Контактная информация -->
              <div class="lg:w-2/3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Контакты -->
                  <div class="space-y-4">
                    <h4
                      class="text-lg font-semibold text-white flex items-center gap-2"
                    >
                      <svg
                        class="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Контактная информация
                    </h4>

                    <div class="space-y-3">
                      <div>
                        <p class="text-sm text-muted-foreground mb-1">Email</p>
                        <p class="text-white font-medium">
                          {{ customerData.email }}
                        </p>
                      </div>

                      <div v-if="customerData.phone">
                        <p class="text-sm text-muted-foreground mb-1">
                          Телефон
                        </p>
                        <p class="text-white font-medium">
                          {{ customerData.phone }}
                        </p>
                      </div>

                      <div v-if="customerData.address">
                        <p class="text-sm text-muted-foreground mb-1">Адрес</p>
                        <p class="text-white">{{ customerData.address }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Мета-информация -->
                  <div class="space-y-4">
                    <h4
                      class="text-lg font-semibold text-white flex items-center gap-2"
                    >
                      <svg
                        class="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Информация о клиенте
                    </h4>

                    <div class="space-y-3">
                      <div>
                        <p class="text-sm text-muted-foreground mb-1">
                          Дата регистрации
                        </p>
                        <p class="text-white">
                          {{ formatDate(customerData.$createdAt) }}
                        </p>
                      </div>

                      <div>
                        <p class="text-sm text-muted-foreground mb-1">
                          Последнее обновление
                        </p>
                        <p class="text-white">
                          {{ formatDate(customerData.$updatedAt) }}
                        </p>
                      </div>

                      <div v-if="customerData.notes">
                        <p class="text-sm text-muted-foreground mb-1">
                          Заметки
                        </p>
                        <p class="text-white bg-input/50 rounded-lg p-3">
                          {{ customerData.notes }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Статистика -->
        <div
          v-if="stats"
          class="bg-card border border-border rounded-xl overflow-hidden"
        >
          <div
            class="px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10"
          >
            <h2 class="text-xl font-semibold text-white">
              Статистика по сделкам
            </h2>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="bg-input/30 border border-input rounded-lg p-4">
                <p class="text-sm text-muted-foreground mb-1">Всего сделок</p>
                <p class="text-2xl font-bold text-white">
                  {{ stats.totalDeals }}
                </p>
              </div>

              <div class="bg-input/30 border border-input rounded-lg p-4">
                <p class="text-sm text-muted-foreground mb-1">Общая сумма</p>
                <p class="text-2xl font-bold text-white">
                  {{ formatCurrency(stats.totalAmount) }}
                </p>
              </div>

              <div class="bg-input/30 border border-input rounded-lg p-4">
                <p class="text-sm text-muted-foreground mb-1">
                  Активные сделки
                </p>
                <p class="text-2xl font-bold text-yellow-500">
                  {{ stats.activeDeals }}
                </p>
              </div>

              <div class="bg-input/30 border border-input rounded-lg p-4">
                <p class="text-sm text-muted-foreground mb-1">Завершённые</p>
                <p class="text-2xl font-bold text-green-500">
                  {{ stats.completedDeals }}
                </p>
              </div>
            </div>

            <div
              v-if="stats.totalDeals > 0"
              class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <p class="text-sm text-muted-foreground mb-1">
                  Средняя сумма сделки
                </p>
                <p class="text-lg font-semibold text-white">
                  {{ formatCurrency(stats.avgDealAmount) }}
                </p>
              </div>

              <div>
                <p class="text-sm text-muted-foreground mb-1">
                  Дата последней сделки
                </p>
                <p class="text-white">{{ formatDate(stats.lastDealDate) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Сделки клиента -->
        <div class="bg-card border border-border rounded-xl overflow-hidden">
          <div
            class="px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10"
          >
            <h2 class="text-xl font-semibold text-white">Сделки клиента</h2>
          </div>

          <div class="p-6">
            <!-- Загрузка сделок -->
            <div v-if="isDealsLoading" class="text-center py-8">
              <div
                class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"
              ></div>
              <p class="text-muted-foreground">Загрузка сделок...</p>
            </div>

            <!-- Нет сделок -->
            <div v-else-if="!dealsData?.length" class="text-center py-12">
              <div class="text-4xl mb-4">💼</div>
              <p class="text-xl font-semibold text-white mb-2">
                Сделок пока нет
              </p>
              <p class="text-muted-foreground">
                У этого клиента ещё нет сделок
              </p>
            </div>

            <!-- Список сделок -->
            <div v-else class="space-y-4">
              <div
                v-for="deal in dealsData"
                :key="deal.$id"
                class="bg-input/30 border border-input rounded-lg p-4 hover:bg-input/50 transition-colors"
              >
                <div
                  class="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div class="flex-1">
                    <div class="flex items-start justify-between mb-2">
                      <h3 class="text-lg font-semibold text-white">
                        {{ deal.name }}
                      </h3>
                      <span
                        :class="[
                          'px-3 py-1 rounded-full text-xs font-medium',
                          getStatusClass(deal.status),
                        ]"
                      >
                        {{ getStatusLabel(deal.status) }}
                      </span>
                    </div>

                    <p
                      v-if="deal.description"
                      class="text-muted-foreground mb-3"
                    >
                      {{ deal.description }}
                    </p>

                    <div class="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span class="text-muted-foreground">Сумма:</span>
                        <span class="text-white font-medium ml-2">{{
                          formatCurrency(deal.price)
                        }}</span>
                      </div>

                      <div v-if="deal.paymentMethod">
                        <span class="text-muted-foreground">Оплата:</span>
                        <span class="text-white ml-2">{{
                          deal.paymentMethod
                        }}</span>
                      </div>

                      <div v-if="deal.quantity && deal.quantity > 1">
                        <span class="text-muted-foreground">Количество:</span>
                        <span class="text-white ml-2"
                          >{{ deal.quantity }} шт.</span
                        >
                      </div>
                    </div>
                  </div>

                  <div class="text-sm text-muted-foreground min-w-[200px]">
                    <div>Создана: {{ formatDate(deal.$createdAt) }}</div>
                    <div>Обновлена: {{ formatDate(deal.$updatedAt) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
</style>
