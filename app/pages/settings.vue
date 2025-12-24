<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import type { Ref } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import { userSettingsApi } from "@/api/userSettings.api";
import { useSeoMeta } from "nuxt/app";

const authStore = useAuthStore();

const emailEnabled: Ref<boolean> = ref(true);
const emailDaily: Ref<boolean> = ref(true);
const emailWeekly: Ref<boolean> = ref(true);
const emailNewLead: Ref<boolean> = ref(true);
const emailNewTask: Ref<boolean> = ref(true);
const emailPayment: Ref<boolean> = ref(true);
const emailAddress: Ref<string> = ref("");

const pushEnabled: Ref<boolean> = ref(false);
const pushNewLead: Ref<boolean> = ref(true);
const pushNewMessage: Ref<boolean> = ref(true);
const pushTaskDeadline: Ref<boolean> = ref(true);
const pushUrgentTask: Ref<boolean> = ref(true);
const hasPushPermission: Ref<boolean> = ref(false);

const isLoading: Ref<boolean> = ref(false);

onMounted(async (): Promise<void> => {
  hasPushPermission.value =
    "Notification" in window && Notification.permission === "granted";

  if (authStore.isAuth) {
    await loadSettings();
  }
});

watch(
  [
    emailEnabled,
    emailDaily,
    emailWeekly,
    emailNewLead,
    emailNewTask,
    emailPayment,
    emailAddress,
    pushEnabled,
    pushNewLead,
    pushNewMessage,
    pushTaskDeadline,
    pushUrgentTask,
  ],
  debounce(async (): Promise<void> => {
    if (authStore.isAuth) {
      await saveSettings();
    }
  }, 1000)
);

const loadSettings = async (): Promise<void> => {
  isLoading.value = true;
  try {
    const savedSettings = await userSettingsApi.loadSettings();

    if (savedSettings) {
      emailEnabled.value = savedSettings.emailEnabled ?? true;
      emailDaily.value = savedSettings.emailDaily ?? true;
      emailWeekly.value = savedSettings.emailWeekly ?? true;
      emailNewLead.value = savedSettings.emailNewLead ?? true;
      emailNewTask.value = savedSettings.emailNewTask ?? true;
      emailPayment.value = savedSettings.emailPayment ?? true;
      emailAddress.value = savedSettings.emailAddress || "";
      pushEnabled.value = savedSettings.pushEnabled ?? false;
      pushNewLead.value = savedSettings.pushNewLead ?? true;
      pushNewMessage.value = savedSettings.pushNewMessage ?? true;
      pushTaskDeadline.value = savedSettings.pushTaskDeadline ?? true;
      pushUrgentTask.value = savedSettings.pushUrgentTask ?? true;
    }
  } catch (error) {
    console.error("Ошибка загрузки настроек:", error);
  } finally {
    isLoading.value = false;
  }
};

const saveSettings = async (): Promise<void> => {
  if (!authStore.isAuth) {
    alert("Для сохранения настроек необходимо войти в систему");
    return;
  }

  try {
    const settings = {
      emailEnabled: emailEnabled.value,
      emailDaily: emailDaily.value,
      emailWeekly: emailWeekly.value,
      emailNewLead: emailNewLead.value,
      emailNewTask: emailNewTask.value,
      emailPayment: emailPayment.value,
      emailAddress: emailAddress.value,
      pushEnabled: pushEnabled.value,
      pushNewLead: pushNewLead.value,
      pushNewMessage: pushNewMessage.value,
      pushTaskDeadline: pushTaskDeadline.value,
      pushUrgentTask: pushUrgentTask.value,
    };

    await userSettingsApi.saveSettings(settings);
    console.log("Настройки сохранены");
  } catch (error) {
    console.error("Ошибка сохранения настроек:", error);
    alert("Не удалось сохранить настройки");
  }
};

const enableAll = async (): Promise<void> => {
  emailEnabled.value = true;
  emailDaily.value = true;
  emailWeekly.value = true;
  emailNewLead.value = true;
  emailNewTask.value = true;
  emailPayment.value = true;

  pushEnabled.value = true;
  pushNewLead.value = true;
  pushNewMessage.value = true;
  pushTaskDeadline.value = true;
  pushUrgentTask.value = true;

  if (!hasPushPermission.value) {
    await requestPushPermission();
  }

  alert("Все уведомления включены!");
  await saveSettings();
};

const disableAll = async (): Promise<void> => {
  emailEnabled.value = false;
  pushEnabled.value = false;
  alert("Все уведомления отключены!");
  await saveSettings();
};

const resetSettings = async (): Promise<void> => {
  if (confirm("Сбросить все настройки к значениям по умолчанию?")) {
    emailEnabled.value = true;
    emailDaily.value = true;
    emailWeekly.value = true;
    emailNewLead.value = true;
    emailNewTask.value = true;
    emailPayment.value = true;
    emailAddress.value = "";

    pushEnabled.value = false;
    pushNewLead.value = true;
    pushNewMessage.value = true;
    pushTaskDeadline.value = true;
    pushUrgentTask.value = true;

    try {
      await userSettingsApi.deleteSettings();
      alert("Настройки сброшены к значениям по умолчанию!");
    } catch (error) {
      console.error("Ошибка сброса настроек:", error);
    }
  }
};

const requestPushPermission = async (): Promise<void> => {
  if (!("Notification" in window)) {
    alert("Ваш браузер не поддерживает push-уведомления");
    return;
  }

  const permission = await Notification.requestPermission();
  hasPushPermission.value = permission === "granted";

  if (hasPushPermission.value) {
    alert("Разрешение на push-уведомления получено!");
    pushEnabled.value = true;
  } else {
    alert(
      "Разрешение на push-уведомления не получено. Проверьте настройки браузера."
    );
  }

  await saveSettings();
};

function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

useSeoMeta({
  title: "Настройки",
});
</script>

<template>
  <div class="min-h-screen p-4">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 ml-6">
        <h1 class="text-2xl md:text-3xl font-bold mb-2">Настройки</h1>
        <p class="text-gray-500">Настройте систему уведомлений</p>
      </div>

      <div class="p-4 md:p-6">
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold flex items-center gap-2">
              📧 Email уведомления
            </h2>
            <label class="flex items-center cursor-pointer">
              <div class="relative">
                <input
                  type="checkbox"
                  class="sr-only"
                  :checked="emailEnabled"
                  @change="emailEnabled = !emailEnabled"
                />
                <div
                  class="w-12 h-6 bg-gray-300 rounded-full shadow-inner transition-colors duration-200"
                  :class="{ 'bg-blue-600': emailEnabled }"
                ></div>
                <div
                  class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-200 transform"
                  :class="{ 'translate-x-6': emailEnabled }"
                ></div>
              </div>
            </label>
          </div>

          <div v-if="emailEnabled" class="space-y-3">
            <div class="flex items-center gap-3 p-3 border-b">
              <input
                type="checkbox"
                v-model="emailDaily"
                class="w-5 h-5 text-blue-600"
              />
              <div>
                <p class="font-medium">Ежедневный дайджест</p>
                <p class="text-sm text-gray-500">Сводка за день в 18:00</p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 border-b">
              <input
                type="checkbox"
                v-model="emailWeekly"
                class="w-5 h-5 text-blue-600"
              />
              <div>
                <p class="font-medium">Еженедельный отчет</p>
                <p class="text-sm text-gray-500">Итоги недели в понедельник</p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 border-b">
              <input
                type="checkbox"
                v-model="emailNewLead"
                class="w-5 h-5 text-blue-600"
              />
              <div>
                <p class="font-medium">Новый лид</p>
                <p class="text-sm text-gray-500">При создании нового клиента</p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 border-b">
              <input
                type="checkbox"
                v-model="emailNewTask"
                class="w-5 h-5 text-blue-600"
              />
              <div>
                <p class="font-medium">Новая задача</p>
                <p class="text-sm text-gray-500">При назначении новой задачи</p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 border-b">
              <input
                type="checkbox"
                v-model="emailPayment"
                class="w-5 h-5 text-blue-600"
              />
              <div>
                <p class="font-medium">Получен платеж</p>
                <p class="text-sm text-gray-500">При поступлении оплаты</p>
              </div>
            </div>

            <div class="mt-4">
              <label class="block text-sm font-medium mb-2"
                >Email для уведомлений</label
              >
              <input
                v-model="emailAddress"
                type="email"
                placeholder="your@email.com"
                class="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div v-else class="text-center py-6">
            <p class="text-gray-500">Email уведомления отключены</p>
          </div>
        </div>

        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold flex items-center gap-2">
              🔔 Push уведомления в браузере
            </h2>
            <label class="flex items-center cursor-pointer">
              <div class="relative">
                <input
                  type="checkbox"
                  class="sr-only"
                  v-model="pushEnabled"
                  :disabled="!hasPushPermission"
                />
                <div
                  class="w-12 h-6 rounded-full"
                  :class="
                    hasPushPermission
                      ? pushEnabled
                        ? 'bg-blue-600'
                        : 'bg-gray-300'
                      : 'bg-gray-200'
                  "
                ></div>
                <div
                  class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform"
                  :class="{ 'translate-x-6': pushEnabled && hasPushPermission }"
                ></div>
              </div>
            </label>
          </div>

          <div v-if="pushEnabled && hasPushPermission" class="space-y-3">
            <div class="flex items-center gap-3 p-3 border-b">
              <input
                type="checkbox"
                v-model="pushNewLead"
                class="w-5 h-5 text-blue-600"
              />
              <div>
                <p class="font-medium">Новый лид</p>
                <p class="text-sm text-gray-500">Мгновенное уведомление</p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 border-b">
              <input
                type="checkbox"
                v-model="pushNewMessage"
                class="w-5 h-5 text-blue-600"
              />
              <div>
                <p class="font-medium">Новое сообщение</p>
                <p class="text-sm text-gray-500">В чате или от клиента</p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 border-b">
              <input
                type="checkbox"
                v-model="pushTaskDeadline"
                class="w-5 h-5 text-blue-600"
              />
              <div>
                <p class="font-medium">Дедлайн задачи</p>
                <p class="text-sm text-gray-500">За 1 час до срока</p>
              </div>
            </div>

            <div class="flex items-center gap-3 p-3 border-b">
              <input
                type="checkbox"
                v-model="pushUrgentTask"
                class="w-5 h-5 text-blue-600"
              />
              <div>
                <p class="font-medium">Срочная задача</p>
                <p class="text-sm text-gray-500">Высокий приоритет</p>
              </div>
            </div>
          </div>

          <div v-else-if="!hasPushPermission" class="text-center py-6">
            <p class="text-gray-500 mb-3">Требуется разрешение браузера</p>
            <button
              @click="requestPushPermission"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Запросить разрешение
            </button>
          </div>

          <div v-else class="text-center py-6">
            <p class="text-gray-500">Push уведомления отключены</p>
          </div>
        </div>

        <div
          class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-300"
        >
          <button
            @click="saveSettings"
            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Сохранить настройки
          </button>
          <button
            @click="enableAll"
            class="px-6 py-3 border border-gray-500 rounded-lg hover:bg-primary transition-colors"
          >
            Включить все
          </button>
          <button
            @click="disableAll"
            class="px-6 py-3 border border-gray-500 rounded-lg hover:bg-primary transition-colors"
          >
            Отключить все
          </button>
          <button
            @click="resetSettings"
            class="px-6 py-3 border border-red-800 text-white rounded-lg hover:bg-red-800 transition-colors"
          >
            Сбросить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
