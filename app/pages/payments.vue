<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { DB, Query, ID, type Models } from "~/Util/appwrite";
import {
  DB_ID,
  COLLECTION_DEALS,
  COLLECTION_CUSTOMERS,
} from "~/constants/app.constants";
import { useSeoMeta } from "nuxt/app";

interface Customer extends Models.Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

type DealStatus = "todo" | "to-be-agreed" | "in-progress" | "produced" | "done";

interface Deal extends Models.Document {
  name: string;
  price: number;
  status: DealStatus;
  customer: string;
  description?: string;
  paymentMethod?: string;
  quantity?: number;
  notes?: string;
  customerName?: string;
  customerEmail?: string;
}

interface PaymentWithCustomer extends Deal {
  customer?: Customer;
}

interface StatusOption {
  value: DealStatus;
  label: string;
  color: string;
}

const payments = ref<PaymentWithCustomer[]>([]);
const loading = ref<boolean>(false);
const selectedPayment = ref<PaymentWithCustomer | null>(null);
const isOpenForm = ref<boolean>(false);
const isPending = ref<boolean>(false);

const name = ref<string>("");
const price = ref<string>("");
const customerName = ref<string>("");
const customerEmail = ref<string>("");
const description = ref<string>("");
const status = ref<DealStatus>("todo");
const paymentMethod = ref<string>("");
const quantity = ref<number>(1);
const notes = ref<string>("");

const searchQuery = ref<string>("");
const statusFilter = ref<string>("");
const currentPage = ref<number>(1);
const itemsPerPage = 10;

const statusOptions: StatusOption[] = [
  { value: "todo", label: "Новая", color: "bg-gray-500/20 text-gray-500" },
  {
    value: "to-be-agreed",
    label: "На согласовании",
    color: "bg-blue-500/20 text-blue-500",
  },
  {
    value: "in-progress",
    label: "В работе",
    color: "bg-yellow-500/20 text-yellow-500",
  },
  {
    value: "produced",
    label: "Произведено",
    color: "bg-purple-500/20 text-purple-500",
  },
  {
    value: "done",
    label: "Выполнено",
    color: "bg-green-500/20 text-green-500",
  },
];

onMounted(() => {
  fetchPayments();
});

const getStatusLabel = (statusValue: DealStatus): string => {
  const option = statusOptions.find((opt) => opt.value === statusValue);
  return option ? option.label : statusValue;
};

const getStatusClass = (statusValue: DealStatus): string => {
  const option = statusOptions.find((opt) => opt.value === statusValue);
  return option ? option.color : "bg-gray-500/20 text-gray-500";
};

const fetchPayments = async (): Promise<void> => {
  loading.value = true;
  try {
    const deals = await DB.listDocuments<Deal>(DB_ID, COLLECTION_DEALS, [
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);

    const paymentsWithCustomers = await Promise.all(
      deals.documents.map(async (deal) => {
        if (deal.customer) {
          try {
            const customer = await DB.getDocument<Customer>(
              DB_ID,
              COLLECTION_CUSTOMERS,
              deal.customer
            );
            return { ...deal, customer };
          } catch (error) {
            console.warn("Клиент не найден:", error);
            return deal as PaymentWithCustomer;
          }
        }
        return deal as PaymentWithCustomer;
      })
    );

    payments.value = paymentsWithCustomers;
  } catch (error) {
    console.error("Ошибка загрузки платежей:", error);
    alert("Ошибка загрузки данных. Проверьте подключение к интернету.");
  } finally {
    loading.value = false;
  }
};

const createDeal = async (): Promise<void> => {
  isPending.value = true;
  try {
    if (
      !name.value ||
      !price.value ||
      !customerName.value ||
      !customerEmail.value
    ) {
      alert("Заполните все обязательные поля (отмечены *)");
      isPending.value = false;
      return;
    }
    let customerId: string;
    try {
      const existingCustomers = await DB.listDocuments<Customer>(
        DB_ID,
        COLLECTION_CUSTOMERS,
        [Query.equal("email", customerEmail.value), Query.limit(1)]
      );

      if (existingCustomers.documents.length > 0) {
        customerId = existingCustomers.documents[0].$id;
        console.log(
          "Используем существующего клиента:",
          existingCustomers.documents[0].name
        );
      } else {
        const customerData: Partial<Customer> = {
          name: customerName.value,
          email: customerEmail.value,
        };

        const customer = await DB.createDocument<Customer>(
          DB_ID,
          COLLECTION_CUSTOMERS,
          ID.unique(),
          customerData as Customer
        );
        customerId = customer.$id;
        console.log("Создан новый клиент:", customer.name);
      }
    } catch (error) {
      console.error("Ошибка при работе с клиентом:", error);
      alert("Ошибка при обработке клиента. Попробуйте еще раз.");
      isPending.value = false;
      return;
    }

    const dealData: Partial<Deal> = {
      name: name.value,
      price: parseFloat(price.value),
      status: status.value,
      customer: customerId,
      ...(description.value && { description: description.value }),
      ...(paymentMethod.value && { paymentMethod: paymentMethod.value }),
      ...(notes.value && { notes: notes.value }),
      quantity: quantity.value || 1,
    };

    await DB.createDocument<Deal>(
      DB_ID,
      COLLECTION_DEALS,
      ID.unique(),
      dealData as Deal
    );

    resetForm();
    await fetchPayments();
    isOpenForm.value = false;

    alert("Сделка успешно создана!");
  } catch (error: any) {
    console.error("Ошибка создания сделки:", error);

    if (error.message.includes("Unknown attribute")) {
      const attribute = error.message.match(/"([^"]+)"/)?.[1];
      alert(
        `Ошибка: поле "${attribute}" не существует в коллекции. Добавьте его через Appwrite консоль или уберите из формы.`
      );
    } else if (error.message.includes("Invalid document structure")) {
      alert(
        `Ошибка: некорректная структура данных. Проверьте, что все поля соответствуют структуре коллекции в Appwrite.`
      );
    } else {
      alert(`Ошибка создания сделки: ${error.message}`);
    }
  } finally {
    isPending.value = false;
  }
};

const checkCollectionsStructure = async (): Promise<void> => {
  try {
    console.log("Проверка структуры коллекций...");

    const customersAttrs = await DB.listAttributes(DB_ID, COLLECTION_CUSTOMERS);
    console.log(
      "Поля коллекции customers:",
      customersAttrs.attributes.map((a: any) => a.key)
    );

    const dealsAttrs = await DB.listAttributes(DB_ID, COLLECTION_DEALS);
    console.log(
      "Поля коллекции deals:",
      dealsAttrs.attributes.map((a: any) => a.key)
    );

    const statusAttr = dealsAttrs.attributes.find(
      (a: any) => a.key === "status"
    );
    if (statusAttr && statusAttr.format) {
      console.log("Допустимые значения для status:", statusAttr.format);
    }
  } catch (error) {
    console.error("Ошибка проверки структуры:", error);
  }
};

const resetForm = (): void => {
  name.value = "";
  price.value = "";
  customerName.value = "";
  customerEmail.value = "";
  description.value = "";
  status.value = "todo";
  paymentMethod.value = "";
  quantity.value = 1;
  notes.value = "";
};

const onSubmit = async (e: Event): Promise<void> => {
  e.preventDefault();

  if (!name.value.trim()) {
    alert("Введите название сделки");
    return;
  }

  const priceNum = parseFloat(price.value);
  if (!price.value || isNaN(priceNum) || priceNum <= 0) {
    alert("Введите корректную цену");
    return;
  }

  if (!customerName.value.trim()) {
    alert("Введите имя клиента");
    return;
  }

  if (!customerEmail.value.trim()) {
    alert("Введите email клиента");
    return;
  }

  await createDeal();
};

const filteredPayments = computed((): PaymentWithCustomer[] => {
  let filtered = payments.value;

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((p: PaymentWithCustomer) => {
      const searchableFields = [
        p.name,
        p.customer?.name,
        p.customer?.email,
        p.customerName,
        p.customerEmail,
        p.description,
        p.paymentMethod,
      ];
      return searchableFields.some(
        (field) =>
          field &&
          typeof field === "string" &&
          field.toLowerCase().includes(query)
      );
    });
  }

  if (statusFilter.value) {
    filtered = filtered.filter(
      (p: PaymentWithCustomer) => p.status === statusFilter.value
    );
  }
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filtered.slice(start, end);
});
const totalPayments = computed((): number => payments.value.length);
const completedPayments = computed(
  (): number => payments.value.filter((p) => p.status === "done").length
);
const pendingPayments = computed(
  (): number => payments.value.filter((p) => p.status === "in-progress").length
);
const totalAmount = computed((): number =>
  payments.value.reduce((sum, p) => sum + (p.price || 0), 0)
);

const formatDate = (dateString: string): string => {
  if (!dateString) return "Нет данных";
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTime = (dateString: string): string => {
  if (!dateString) return "Нет данных";
  const date = new Date(dateString);
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const togglePaymentStatus = async (
  payment: PaymentWithCustomer
): Promise<void> => {
  try {
    const statusIndex = statusOptions.findIndex(
      (opt) => opt.value === payment.status
    );
    const nextStatusIndex = (statusIndex + 1) % statusOptions.length;
    const newStatus: DealStatus = statusOptions[nextStatusIndex].value;

    await DB.updateDocument<Deal>(DB_ID, COLLECTION_DEALS, payment.$id, {
      status: newStatus,
    } as Partial<Deal>);

    payment.status = newStatus;

    alert(
      `Статус сделки #${payment.$id.slice(-6)} изменен на "${getStatusLabel(
        newStatus
      )}"`
    );

    fetchPayments();
  } catch (error: any) {
    console.error("Ошибка обновления статуса:", error);
    alert(`Ошибка обновления статуса: ${error.message}`);
  }
};

const openPaymentDetails = (payment: PaymentWithCustomer): void => {
  selectedPayment.value = payment;
};

const nextPage = (): void => {
  if (currentPage.value * itemsPerPage < payments.value.length) {
    currentPage.value++;
  }
};

const previousPage = (): void => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

onMounted(async (): Promise<void> => {
  await fetchPayments();
});

useSeoMeta({
  title: "Платежи",
});
</script>

<template>
  <div class="min-h-screen bg-background text-foreground p-4">
    <div class="max-w-8xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">Платежи</h1>
        <p class="text-muted-foreground">Управление платежами и сделками</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-card border border-border rounded-xl p-4">
          <p class="text-sm text-muted-foreground mb-1">Всего сделок</p>
          <p class="text-2xl font-bold text-white">{{ totalPayments }}</p>
        </div>

        <div class="bg-card border border-border rounded-xl p-4">
          <p class="text-sm text-muted-foreground mb-1">Выполнено</p>
          <p class="text-2xl font-bold text-green-500">
            {{ completedPayments }}
          </p>
        </div>

        <div class="bg-card border border-border rounded-xl p-4">
          <p class="text-sm text-muted-foreground mb-1">В работе</p>
          <p class="text-2xl font-bold text-yellow-500">
            {{ pendingPayments }}
          </p>
        </div>

        <div class="bg-card border border-border rounded-xl p-4">
          <p class="text-sm text-muted-foreground mb-1">Общая сумма</p>
          <p class="text-2xl font-bold text-white">
            {{ totalAmount.toLocaleString() }} ₽
          </p>
        </div>
      </div>

      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по компании или товару..."
            class="w-full px-4 py-3 bg-card border border-input rounded-lg text-white placeholder:text-muted-foreground"
          />
        </div>
        <div class="flex gap-2">
          <select
            v-model="statusFilter"
            class="px-4 py-3 bg-card border border-input rounded-lg text-white cursor-pointer"
          >
            <option value="">Все статусы</option>
            <option
              v-for="option in statusOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          <button
            @click="fetchPayments"
            class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 cursor-pointer"
          >
            Обновить
          </button>
        </div>
      </div>

      <div class="mb-6">
        <button
          @click="isOpenForm = true"
          class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 cursor-pointer"
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
          Добавить сделку
        </button>
      </div>

      <div class="bg-card rounded-xl border border-border overflow-hidden">
        <div v-if="loading" class="p-8 text-center">
          <div
            class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"
          ></div>
          <p class="text-muted-foreground">Загрузка платежей...</p>
        </div>

        <div v-else-if="payments.length === 0" class="p-8 text-center">
          <div class="text-4xl mb-4">💰</div>
          <p class="text-xl font-semibold text-white mb-2">Платежей пока нет</p>
          <p class="text-muted-foreground">
            Начните добавлять сделки и платежи
          </p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-muted border-b border-input">
                <th
                  class="text-left p-4 text-sm font-medium text-muted-foreground"
                >
                  #
                </th>
                <th
                  class="text-left p-4 text-sm font-medium text-muted-foreground"
                >
                  Компания/Клиент
                </th>
                <th
                  class="text-left p-4 text-sm font-medium text-muted-foreground"
                >
                  Товар/Услуга
                </th>
                <th
                  class="text-left p-4 text-sm font-medium text-muted-foreground"
                >
                  Email
                </th>
                <th
                  class="text-left p-4 text-sm font-medium text-muted-foreground"
                >
                  Цена
                </th>
                <th
                  class="text-left p-4 text-sm font-medium text-muted-foreground"
                >
                  Дата создания
                </th>
                <th
                  class="text-left p-4 text-sm font-medium text-muted-foreground"
                >
                  Статус
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
                v-for="(payment, index) in filteredPayments"
                :key="payment.$id"
                class="border-b border-input hover:bg-muted/30 transition-colors"
              >
                <td class="p-4">
                  <div class="text-sm text-muted-foreground">
                    #{{ payment.$id.slice(-6) }}
                  </div>
                  <div class="text-xs text-muted-foreground">
                    {{ index + 1 }} по счету
                  </div>
                </td>
                <td class="p-4">
                  <div class="font-medium text-white">
                    {{
                      payment.customer?.name ||
                      payment.customerName ||
                      "Без названия"
                    }}
                  </div>
                  <div class="text-sm text-muted-foreground">
                    {{
                      payment.customer?.email ||
                      payment.customerEmail ||
                      "Нет контакта"
                    }}
                  </div>
                </td>
                <td class="p-4">
                  <div class="font-medium text-white">{{ payment.name }}</div>
                  <div class="text-xs text-muted-foreground">
                    {{ payment.description || "Без описания" }}
                  </div>
                </td>
                <td class="p-4">
                  <div class="text-sm">
                    {{
                      payment.customer?.email ||
                      payment.customerEmail ||
                      "Email не указан"
                    }}
                  </div>
                  <div class="text-xs text-muted-foreground">
                    {{ payment.customer?.phone || "Телефон не указан" }}
                  </div>
                </td>
                <td class="p-4">
                  <div class="font-semibold text-white">
                    {{ payment.price.toLocaleString() }} ₽
                  </div>
                  <div
                    v-if="payment.paymentMethod"
                    class="text-xs text-muted-foreground"
                  >
                    {{ payment.paymentMethod }}
                  </div>
                </td>
                <td class="p-4">
                  <div class="text-sm">
                    {{ formatDate(payment.$createdAt) }}
                  </div>
                  <div class="text-xs text-muted-foreground">
                    {{ formatTime(payment.$createdAt) }}
                  </div>
                </td>
                <td class="p-4">
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-medium',
                      getStatusClass(payment.status),
                    ]"
                  >
                    {{ getStatusLabel(payment.status) }}
                  </span>
                </td>
                <td class="p-4">
                  <div class="flex gap-2">
                    <button
                      @click="togglePaymentStatus(payment)"
                      class="p-2 hover:bg-input rounded-lg transition-colors cursor-pointer"
                      :title="'Изменить статус на следующий'"
                    >
                      <svg
                        v-if="payment.status === 'done'"
                        class="w-4 h-4 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <svg
                        v-else
                        class="w-4 h-4 text-muted-foreground"
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
                    </button>
                    <button
                      @click="openPaymentDetails(payment)"
                      class="p-2 hover:bg-input rounded-lg transition-colors cursor-pointer"
                      title="Подробнее"
                    >
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
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="payments.length > 0"
          class="flex items-center justify-between p-4 border-t border-input"
        >
          <div class="text-sm text-muted-foreground">
            Показано {{ filteredPayments.length }} из
            {{ payments.length }} платежей
          </div>
          <div class="flex gap-2">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="px-3 py-2 border border-input rounded-lg hover:bg-muted disabled:opacity-50 cursor-pointer"
            >
              Назад
            </button>
            <span class="px-3 py-2 text-sm">Страница {{ currentPage }}</span>
            <button
              @click="nextPage"
              :disabled="currentPage * itemsPerPage >= payments.length"
              class="px-3 py-2 border border-input rounded-lg hover:bg-muted disabled:opacity-50 cursor-pointer"
            >
              Вперед
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="selectedPayment"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="selectedPayment = null"
    >
      <div
        class="bg-card rounded-xl border border-border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-white">Детали сделки</h3>
          <button
            @click="selectedPayment = null"
            class="p-2 hover:bg-input rounded-lg"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-muted-foreground mb-1">ID сделки</p>
              <p class="font-medium text-white">#{{ selectedPayment.$id }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground mb-1">Статус</p>
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  getStatusClass(selectedPayment.status),
                ]"
              >
                {{ getStatusLabel(selectedPayment.status) }}
              </span>
            </div>
          </div>

          <div>
            <h4 class="font-semibold text-white mb-3">Информация о клиенте</h4>
            <div class="bg-muted/30 border border-input rounded-lg p-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-muted-foreground mb-1">Имя клиента</p>
                  <p class="font-medium text-white">
                    {{
                      selectedPayment.customer?.name ||
                      selectedPayment.customerName ||
                      "Не указано"
                    }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground mb-1">Email</p>
                  <p class="font-medium text-white">
                    {{
                      selectedPayment.customer?.email ||
                      selectedPayment.customerEmail ||
                      "Не указан"
                    }}
                  </p>
                </div>
                <div v-if="selectedPayment.customer?.phone">
                  <p class="text-sm text-muted-foreground mb-1">Телефон</p>
                  <p class="font-medium text-white">
                    {{ selectedPayment.customer.phone }}
                  </p>
                </div>
                <div v-if="selectedPayment.customer?.company">
                  <p class="text-sm text-muted-foreground mb-1">Компания</p>
                  <p class="font-medium text-white">
                    {{ selectedPayment.customer.company }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 class="font-semibold text-white mb-3">Информация о сделке</h4>
            <div class="bg-muted/30 border border-input rounded-lg p-4">
              <div class="mb-3">
                <p class="text-sm text-muted-foreground mb-1">Название</p>
                <p class="font-medium text-white">{{ selectedPayment.name }}</p>
              </div>
              <div class="mb-3">
                <p class="text-sm text-muted-foreground mb-1">Описание</p>
                <p class="text-white">
                  {{ selectedPayment.description || "Нет описания" }}
                </p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p class="text-sm text-muted-foreground mb-1">Цена</p>
                  <p class="text-xl font-bold text-white">
                    {{ selectedPayment.price.toLocaleString() }} ₽
                  </p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground mb-1">Количество</p>
                  <p class="font-medium text-white">
                    {{ selectedPayment.quantity || 1 }} шт.
                  </p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground mb-1">
                    Способ оплаты
                  </p>
                  <p class="font-medium text-white">
                    {{ selectedPayment.paymentMethod || "Не указан" }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 class="font-semibold text-white mb-3">
              Дополнительная информация
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-muted-foreground mb-1">Дата создания</p>
                <p class="font-medium text-white">
                  {{ formatDate(selectedPayment.$createdAt) }}
                </p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-1">
                  Дата обновления
                </p>
                <p class="font-medium text-white">
                  {{
                    formatDate(
                      selectedPayment.$updatedAt || selectedPayment.$createdAt
                    )
                  }}
                </p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-1">Примечания</p>
                <p class="text-white">
                  {{ selectedPayment.notes || "Нет примечаний" }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex gap-3 pt-4 border-t border-input">
            <button
              @click="togglePaymentStatus(selectedPayment)"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Изменить статус
            </button>
            <button
              @click="selectedPayment = null"
              class="px-4 py-2 border border-input rounded-lg hover:bg-muted"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isOpenForm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="isOpenForm = false"
    >
      <div
        class="bg-card rounded-xl border border-border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-white">
            Добавить новую сделку
          </h3>
          <button
            @click="isOpenForm = false"
            class="p-2 hover:bg-input rounded-lg"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-white mb-1"
                >Название сделки *</label
              >
              <input
                v-model="name"
                required
                class="w-full px-4 py-3 bg-card border border-input rounded-lg text-white placeholder:text-muted-foreground"
                placeholder="Например: Разработка сайта"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-white mb-1"
                >Цена (₽) *</label
              >
              <input
                v-model="price"
                type="number"
                required
                min="0"
                step="0.01"
                class="w-full px-4 py-3 bg-card border border-input rounded-lg text-white placeholder:text-muted-foreground"
                placeholder="10000"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-white mb-1"
                >Имя клиента *</label
              >
              <input
                v-model="customerName"
                required
                class="w-full px-4 py-3 bg-card border border-input rounded-lg text-white placeholder:text-muted-foreground"
                placeholder="Иван Иванов"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-white mb-1"
                >Email клиента *</label
              >
              <input
                v-model="customerEmail"
                type="email"
                required
                class="w-full px-4 py-3 bg-card border border-input rounded-lg text-white placeholder:text-muted-foreground"
                placeholder="client@example.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-white mb-1"
                >Описание</label
              >
              <textarea
                v-model="description"
                rows="3"
                class="w-full px-4 py-3 bg-card border border-input rounded-lg text-white placeholder:text-muted-foreground"
                placeholder="Описание сделки..."
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-white mb-1"
                >Статус</label
              >
              <select
                v-model="status"
                class="w-full px-4 py-3 bg-card border border-input rounded-lg text-white"
              >
                <option
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-white mb-1"
                >Способ оплаты</label
              >
              <input
                v-model="paymentMethod"
                class="w-full px-4 py-3 bg-card border border-input rounded-lg text-white placeholder:text-muted-foreground"
                placeholder="Банковский перевод, карта и т.д."
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-white mb-1"
                >Количество</label
              >
              <input
                v-model="quantity"
                type="number"
                min="1"
                class="w-full px-4 py-3 bg-card border border-input rounded-lg text-white placeholder:text-muted-foreground"
                placeholder="1"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-white mb-1"
              >Примечания</label
            >
            <textarea
              v-model="notes"
              rows="2"
              class="w-full px-4 py-3 bg-card border border-input rounded-lg text-white placeholder:text-muted-foreground"
              placeholder="Дополнительные примечания..."
            />
          </div>

          <div class="flex gap-3 pt-4 border-t border-input">
            <button
              type="submit"
              :disabled="isPending"
              class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              <span v-if="isPending">Создание...</span>
              <span v-else>Создать сделку</span>
            </button>
            <button
              type="button"
              @click="isOpenForm = false"
              class="px-6 py-3 border border-input rounded-lg hover:bg-muted"
            >
              Отмена
            </button>
          </div>
        </form>
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

table {
  border-collapse: separate;
  border-spacing: 0;
}

th:first-child {
  border-top-left-radius: 0.5rem;
}

th:last-child {
  border-top-right-radius: 0.5rem;
}

tr:last-child td {
  border-bottom: none;
}
</style>
