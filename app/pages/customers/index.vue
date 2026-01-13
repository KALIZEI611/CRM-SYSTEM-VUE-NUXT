<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import { useSeoMeta } from "nuxt/app";
import {
  COLLECTION_CUSTOMERS,
  COLLECTION_DEALS,
  DB_ID,
} from "~/constants/app.constants";
import { DB } from "~/Util/appwrite";
import { Query } from "appwrite";
import { computed } from "vue";

useSeoMeta({
  title: "Клиенты",
});

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
  customer: string;
  status: string;
  price: number;
  $createdAt: string;
}

interface CustomerWithStats extends ICustomer {
  dealCount: number;
  totalAmount: number;
  lastDealDate?: string;
  activeDeals: number;
  completedDeals: number;
}

const { data: customersData, isLoading } = useQuery({
  queryKey: ["customers"],
  queryFn: async () => {
    // Получаем всех клиентов
    const customersResponse = await DB.listDocuments(
      DB_ID,
      COLLECTION_CUSTOMERS,
      [Query.orderDesc("$createdAt"), Query.limit(100)]
    );

    const customers = customersResponse.documents as unknown as ICustomer[];

    // Получаем все сделки для статистики
    const dealsResponse = await DB.listDocuments(DB_ID, COLLECTION_DEALS, [
      Query.limit(1000),
    ]);

    const deals = dealsResponse.documents as unknown as IDeal[];

    // Добавляем статистику к каждому клиенту
    const customersWithStats = customers.map((customer) => {
      const customerDeals = deals.filter(
        (deal) => deal.customer === customer.$id
      );
      const dealCount = customerDeals.length;
      const totalAmount = customerDeals.reduce(
        (sum, deal) => sum + (deal.price || 0),
        0
      );
      const completedDeals = customerDeals.filter(
        (deal) => deal.status === "done"
      ).length;
      const activeDeals = customerDeals.filter((deal) =>
        ["todo", "to-be-agreed", "in-progress", "produced"].includes(
          deal.status
        )
      ).length;

      const lastDeal = customerDeals.sort(
        (a, b) =>
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
      )[0];

      return {
        ...customer,
        dealCount,
        totalAmount,
        lastDealDate: lastDeal?.$createdAt,
        activeDeals,
        completedDeals,
      } as CustomerWithStats;
    });

    return customersWithStats;
  },
});

// Компьютед свойства для общей статистики
const totalStats = computed(() => {
  if (!customersData.value)
    return { totalCustomers: 0, totalDeals: 0, totalAmount: 0 };

  const customers = customersData.value;
  return {
    totalCustomers: customers.length,
    totalDeals: customers.reduce(
      (sum, customer) => sum + customer.dealCount,
      0
    ),
    totalAmount: customers.reduce(
      (sum, customer) => sum + customer.totalAmount,
      0
    ),
    activeDeals: customers.reduce(
      (sum, customer) => sum + customer.activeDeals,
      0
    ),
    completedDeals: customers.reduce(
      (sum, customer) => sum + customer.completedDeals,
      0
    ),
  };
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
</script>

<template>
  <div class="min-h-screen bg-background text-foreground p-4">
    <div class="max-w-8xl mx-auto">
      <!-- Заголовок -->
      <div class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">Клиенты</h1>
        <p class="text-muted-foreground">
          Просмотр информации о клиентах и их активности
        </p>
      </div>

      <!-- Таблица клиентов -->
      <div class="bg-card border border-border rounded-xl overflow-hidden">
        <!-- Заголовок таблицы -->
        <div class="px-6 py-4 border-b border-border">
          <h2 class="text-lg font-semibold text-white">Список клиентов</h2>
          <p class="text-sm text-muted-foreground mt-1">
            {{ totalStats.totalCustomers }} клиентов,
            {{ totalStats.totalDeals }} сделок
          </p>
        </div>

        <!-- Загрузка -->
        <div v-if="isLoading" class="p-12 text-center">
          <div
            class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"
          ></div>
          <p class="text-muted-foreground">Загрузка данных о клиентах...</p>
        </div>

        <!-- Нет клиентов -->
        <div v-else-if="!customersData?.length" class="p-12 text-center">
          <div class="text-4xl mb-4">👤</div>
          <p class="text-xl font-semibold text-white mb-2">Клиентов пока нет</p>
          <p class="text-muted-foreground">
            Добавьте первого клиента через систему сделок
          </p>
        </div>

        <!-- Таблица -->
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-muted border-b border-input">
                <th
                  class="text-left p-4 text-sm font-medium text-muted-foreground w-16"
                >
                  Фото
                </th>
                <th
                  class="text-left p-4 text-sm font-medium text-muted-foreground"
                >
                  Клиент
                </th>
                <th
                  class="text-left p-4 text-sm font-medium text-muted-foreground"
                >
                  Контакты
                </th>
                <th
                  class="text-left p-4 text-sm font-medium text-muted-foreground"
                >
                  Сделки
                </th>
                <th
                  class="text-left p-4 text-sm font-medium text-muted-foreground"
                >
                  Статистика
                </th>
                <th
                  class="text-left p-4 text-sm font-medium text-muted-foreground"
                >
                  Дата регистрации
                </th>
                <th
                  class="text-left p-4 text-sm font-medium text-muted-foreground"
                >
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="customer in customersData"
                :key="customer.$id"
                class="border-b border-input hover:bg-muted/30 transition-colors"
              >
                <!-- Фото -->
                <td class="p-4">
                  <div
                    class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden"
                  >
                    <img
                      v-if="customer.avatar_url"
                      :src="customer.avatar_url"
                      :alt="customer.name"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-primary font-semibold text-lg">
                      {{ customer.name.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </td>

                <!-- Информация о клиенте -->
                <td class="p-4">
                  <div class="font-medium text-white">{{ customer.name }}</div>
                  <div
                    v-if="customer.company"
                    class="text-sm text-muted-foreground"
                  >
                    {{ customer.company }}
                  </div>
                  <div
                    v-if="customer.from_source"
                    class="text-xs text-muted-foreground mt-1"
                  >
                    <span class="px-2 py-1 bg-input rounded-md"
                      >Источник: {{ customer.from_source }}</span
                    >
                  </div>
                </td>

                <!-- Контакты -->
                <td class="p-4">
                  <div class="space-y-1">
                    <div class="text-sm text-white flex items-center gap-2">
                      <svg
                        class="w-4 h-4 text-muted-foreground"
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
                      {{ customer.email }}
                    </div>
                    <div
                      v-if="customer.phone"
                      class="text-sm text-muted-foreground flex items-center gap-2"
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
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {{ customer.phone }}
                    </div>
                  </div>
                </td>

                <!-- Сделки -->
                <td class="p-4">
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <div class="text-2xl font-bold text-white">
                        {{ customer.dealCount }}
                      </div>
                      <div class="text-sm text-muted-foreground">сделок</div>
                    </div>
                    <div class="flex gap-2">
                      <span
                        class="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-md"
                      >
                        ✓ {{ customer.completedDeals }}
                      </span>
                      <span
                        class="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-md"
                      >
                        ⚡ {{ customer.activeDeals }}
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Статистика -->
                <td class="p-4">
                  <div class="space-y-2">
                    <div class="text-lg font-semibold text-white">
                      {{ formatCurrency(customer.totalAmount) }}
                    </div>
                    <div
                      v-if="customer.lastDealDate"
                      class="text-xs text-muted-foreground"
                    >
                      Последняя сделка: {{ formatDate(customer.lastDealDate) }}
                    </div>
                  </div>
                </td>

                <!-- Дата регистрации -->
                <td class="p-4">
                  <div class="space-y-1">
                    <div class="text-sm text-white">
                      {{ formatDate(customer.$createdAt) }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      Обновлено: {{ formatDate(customer.$updatedAt) }}
                    </div>
                  </div>
                </td>

                <!-- Действия -->
                <td class="p-4">
                  <button
                    @click="$router.push(`/customers/${customer.$id}`)"
                    class="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors flex items-center gap-2"
                    title="Просмотреть детали"
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Подробнее
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
