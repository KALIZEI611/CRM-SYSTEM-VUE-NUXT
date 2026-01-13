<script setup lang="ts">
import { useSeoMeta } from "nuxt/app";
import { ref, computed, onMounted } from "vue";
import { useAuth } from "~/composables/useAuth";

useSeoMeta({
  title: "Настройки",
  description: "Настройки профиля и учетной записи CRM системы",
});

const { user, getUser, updateUserName, updateUserPhone, updatePassword } =
  useAuth();

// Активный раздел настроек
const activeTab = ref("profile");

// Данные для форм
const userData = ref({
  name: "",
  email: "",
  phone: "",
  language: "ru",
  timezone: "Europe/Moscow",
  dateFormat: "DD.MM.YYYY",
  currency: "RUB",
});

const passwordData = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// Отдельное поле для пароля при изменении телефона
const phonePassword = ref("");

// Переменные для показа паролей
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const showPhonePassword = ref(false);

// Состояния
const isLoading = ref(false);
const isSavingName = ref(false);
const isSavingPhone = ref(false);
const isChangingPassword = ref(false);
const saveMessage = ref("");
const messageType = ref<"success" | "error">("success");

// Опции для селектов
const languages = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

const timezones = [
  { value: "Europe/Moscow", label: "Москва (UTC+3)" },
  { value: "Europe/London", label: "Лондон (UTC+0)" },
  { value: "Europe/Berlin", label: "Берлин (UTC+1)" },
];

const dateFormats = [
  { value: "DD.MM.YYYY", label: "31.12.2024" },
  { value: "MM/DD/YYYY", label: "12/31/2024" },
  { value: "YYYY-MM-DD", label: "2024-12-31" },
];

const currencies = [
  { value: "RUB", label: "Рубль (₽)" },
  { value: "USD", label: "Доллар ($)" },
  { value: "EUR", label: "Евро (€)" },
];

// Загрузка данных пользователя
const loadUserData = async () => {
  try {
    isLoading.value = true;
    const currentUser = await getUser();

    if (currentUser) {
      userData.value = {
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        language: localStorage.getItem("user_language") || "ru",
        timezone: localStorage.getItem("user_timezone") || "Europe/Moscow",
        dateFormat: localStorage.getItem("user_dateFormat") || "DD.MM.YYYY",
        currency: localStorage.getItem("user_currency") || "RUB",
      };
    }
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
    saveMessage.value = "Ошибка загрузки данных профиля";
    messageType.value = "error";
  } finally {
    isLoading.value = false;
  }
};

// Сохранение имени (не требует пароля)
const saveName = async () => {
  try {
    isSavingName.value = true;
    saveMessage.value = "";

    await updateUserName(userData.value.name);

    // Сохраняем настройки в localStorage
    localStorage.setItem("user_language", userData.value.language);
    localStorage.setItem("user_timezone", userData.value.timezone);
    localStorage.setItem("user_dateFormat", userData.value.dateFormat);
    localStorage.setItem("user_currency", userData.value.currency);

    saveMessage.value = "Настройки успешно сохранены";
    messageType.value = "success";

    // Если изменился язык, перезагружаем страницу
    const prevLanguage = localStorage.getItem("user_language");
    if (prevLanguage && userData.value.language !== prevLanguage) {
      setTimeout(() => window.location.reload(), 1500);
    }
  } catch (error: any) {
    console.error("Ошибка сохранения:", error);
    saveMessage.value = error.message || "Ошибка сохранения";
    messageType.value = "error";
  } finally {
    isSavingName.value = false;
  }
};

// Сохранение телефона (требует пароль)
const savePhone = async () => {
  try {
    if (!phonePassword.value) {
      saveMessage.value = "Для изменения телефона введите текущий пароль";
      messageType.value = "error";
      return;
    }

    isSavingPhone.value = true;
    saveMessage.value = "";

    await updateUserPhone(userData.value.phone || "", phonePassword.value);

    phonePassword.value = ""; // Очищаем поле пароля

    saveMessage.value = "Телефон успешно обновлен";
    messageType.value = "success";
  } catch (error: any) {
    console.error("Ошибка сохранения телефона:", error);

    if (error.code === 401 || error.message.includes("password")) {
      saveMessage.value = "Неверный пароль";
    } else {
      saveMessage.value = error.message || "Ошибка сохранения телефона";
    }

    messageType.value = "error";
  } finally {
    isSavingPhone.value = false;
  }
};

// Смена пароля
const changePassword = async () => {
  try {
    if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
      saveMessage.value = "Новые пароли не совпадают";
      messageType.value = "error";
      return;
    }

    if (passwordData.value.newPassword.length < 8) {
      saveMessage.value = "Пароль должен содержать минимум 8 символов";
      messageType.value = "error";
      return;
    }

    isChangingPassword.value = true;
    saveMessage.value = "";

    await updatePassword(
      passwordData.value.newPassword,
      passwordData.value.currentPassword
    );

    saveMessage.value = "Пароль успешно изменен";
    messageType.value = "success";

    // Очищаем форму
    passwordData.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
  } catch (error: any) {
    console.error("Ошибка смены пароля:", error);

    if (error.code === 401 || error.message.includes("password")) {
      saveMessage.value = "Неверный текущий пароль";
    } else {
      saveMessage.value = error.message || "Ошибка смены пароля";
    }

    messageType.value = "error";
  } finally {
    isChangingPassword.value = false;
  }
};

// Инициализация
onMounted(() => {
  loadUserData();
});

const tabs = [
  { id: "profile", label: "Профиль", icon: "ph:user-circle" },
  { id: "notifications", label: "Уведомления", icon: "ph:bell" },
  {
    id: "workspace",
    label: "Рабочее пространство",
    icon: "ph:desktop",
  },
  { id: "security", label: "Безопасность", icon: "ph:shield-check" },
];
</script>

<template>
  <div class="min-h-screen bg-background text-foreground p-4">
    <div class="max-w-8xl mx-auto">
      <!-- Заголовок -->
      <div class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
          Настройки
        </h1>
        <p class="text-muted-foreground">
          Управление вашим профилем и настройками системы
        </p>
      </div>

      <!-- Уведомления -->
      <div
        v-if="saveMessage"
        :class="[
          'mb-6 p-4 border rounded-lg flex items-center justify-between transition-all duration-300',
          messageType === 'success'
            ? 'bg-green-500/10 border-green-500/20 text-green-500'
            : 'bg-red-500/10 border-red-500/20 text-red-500',
        ]"
      >
        <div class="flex items-center space-x-3">
          <Icon
            :name="
              messageType === 'success'
                ? 'ph:check-circle'
                : 'ph:warning-circle'
            "
            class="w-5 h-5"
          />
          <span class="font-medium">{{ saveMessage }}</span>
        </div>
        <button
          @click="saveMessage = ''"
          class="text-muted-foreground hover:text-white transition-colors"
        >
          <Icon name="ph:x" class="w-5 h-5" />
        </button>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Боковая панель -->
        <div class="lg:w-1/4">
          <div class="bg-card border border-border rounded-xl overflow-hidden">
            <nav class="p-2">
              <ul class="space-y-1">
                <li v-for="tab in tabs" :key="tab.id">
                  <button
                    @click="activeTab = tab.id"
                    :class="[
                      'w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3',
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary border-l-4 border-primary font-semibold'
                        : 'text-muted-foreground hover:bg-input hover:text-white',
                    ]"
                  >
                    <Icon
                      :name="tab.icon"
                      :class="[
                        'w-5 h-5',
                        activeTab === tab.id
                          ? 'text-primary'
                          : 'text-muted-foreground',
                      ]"
                    />
                    <span class="text-sm font-medium">{{ tab.label }}</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <!-- Основной контент -->
        <div class="lg:w-3/4">
          <!-- Загрузка -->
          <div
            v-if="isLoading"
            class="bg-card border border-border rounded-xl p-12 text-center"
          >
            <div
              class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"
            ></div>
            <p class="text-muted-foreground">Загрузка данных...</p>
          </div>

          <!-- Профиль -->
          <div v-else-if="activeTab === 'profile'" class="space-y-6">
            <!-- Основная информация -->
            <div
              class="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div class="px-6 py-5 border-b border-border">
                <h2
                  class="text-xl font-semibold text-white flex items-center space-x-2"
                >
                  <Icon name="ph:user" class="w-6 h-6 text-primary" />
                  <span>Основная информация</span>
                </h2>
              </div>
              <div class="p-6 space-y-6">
                <!-- ФИО -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    ФИО <span class="text-red-500">*</span>
                  </label>
                  <div class="flex gap-3">
                    <input
                      v-model="userData.name"
                      type="text"
                      class="flex-1 px-4 py-3 bg-background border border-input rounded-lg text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                      placeholder="Иванов Иван Иванович"
                      required
                    />
                  </div>
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    Email
                  </label>
                  <input
                    :value="userData.email"
                    type="email"
                    class="w-full px-4 py-3 bg-muted border border-input rounded-lg text-muted-foreground cursor-not-allowed"
                    disabled
                  />
                  <p class="mt-2 text-sm text-muted-foreground">
                    Email изменить нельзя
                  </p>
                </div>

                <!-- Телефон -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    Телефон
                  </label>
                  <div class="space-y-3">
                    <div class="flex gap-3">
                      <input
                        v-model="userData.phone"
                        type="tel"
                        class="flex-1 px-4 py-3 bg-background border border-input rounded-lg text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>

                    <!-- Поле для пароля при изменении телефона -->
                    <div>
                      <label class="block text-sm font-medium text-white mb-2">
                        Текущий пароль (для изменения телефона)
                      </label>
                      <div class="flex gap-3">
                        <div class="relative flex-1">
                          <input
                            v-model="phonePassword"
                            :type="showPhonePassword ? 'text' : 'password'"
                            class="w-full px-4 py-3 bg-background border border-input rounded-lg text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors pr-12"
                            placeholder="Введите текущий пароль"
                          />
                          <button
                            @click="showPhonePassword = !showPhonePassword"
                            type="button"
                            class="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                          >
                            <Icon
                              :name="
                                showPhonePassword ? 'ph:eye-slash' : 'ph:eye'
                              "
                              class="w-5 h-5"
                            />
                          </button>
                        </div>
                        <button
                          @click="savePhone"
                          :disabled="isSavingPhone || !phonePassword"
                          :class="[
                            'px-4 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center space-x-2',
                            isSavingPhone || !phonePassword
                              ? 'bg-primary/50 cursor-not-allowed'
                              : 'bg-primary hover:bg-primary/90 cursor-pointer',
                          ]"
                        >
                          <Icon
                            v-if="isSavingPhone"
                            name="ph:circle-notch"
                            class="w-5 h-5 animate-spin"
                          />
                          <Icon v-else name="ph:phone" class="w-5 h-5" />
                          <span>Обновить телефон</span>
                        </button>
                      </div>
                      <p class="mt-2 text-sm text-muted-foreground">
                        Для изменения телефона требуется подтверждение паролем
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Региональные настройки -->
            <div
              class="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div class="px-6 py-5 border-b border-border">
                <h2
                  class="text-xl font-semibold text-white flex items-center space-x-2"
                >
                  <Icon
                    name="ph:globe-hemisphere-west"
                    class="w-6 h-6 text-primary"
                  />
                  <span>Региональные настройки</span>
                </h2>
              </div>
              <div class="p-6 space-y-6">
                <!-- Язык -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    Язык интерфейса
                  </label>
                  <div class="relative">
                    <select
                      v-model="userData.language"
                      class="w-full px-4 py-3 bg-background border border-input rounded-lg text-white focus:border-primary focus:outline-none transition-colors appearance-none"
                    >
                      <option
                        v-for="lang in languages"
                        :key="lang.value"
                        :value="lang.value"
                        class="bg-card py-2"
                      >
                        {{ lang.label }}
                      </option>
                    </select>
                    <Icon
                      name="ph:caret-down"
                      class="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
                    />
                  </div>
                </div>

                <!-- Часовой пояс -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    Часовой пояс
                  </label>
                  <div class="relative">
                    <select
                      v-model="userData.timezone"
                      class="w-full px-4 py-3 bg-background border border-input rounded-lg text-white focus:border-primary focus:outline-none transition-colors appearance-none"
                    >
                      <option
                        v-for="tz in timezones"
                        :key="tz.value"
                        :value="tz.value"
                        class="bg-card py-2"
                      >
                        {{ tz.label }}
                      </option>
                    </select>
                    <Icon
                      name="ph:caret-down"
                      class="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
                    />
                  </div>
                </div>

                <!-- Формат даты -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    Формат даты
                  </label>
                  <div class="relative">
                    <select
                      v-model="userData.dateFormat"
                      class="w-full px-4 py-3 bg-background border border-input rounded-lg text-white focus:border-primary focus:outline-none transition-colors appearance-none"
                    >
                      <option
                        v-for="format in dateFormats"
                        :key="format.value"
                        :value="format.value"
                        class="bg-card py-2"
                      >
                        {{ format.label }}
                      </option>
                    </select>
                    <Icon
                      name="ph:caret-down"
                      class="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
                    />
                  </div>
                </div>

                <!-- Валюта -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    Валюта
                  </label>
                  <div class="relative">
                    <select
                      v-model="userData.currency"
                      class="w-full px-4 py-3 bg-background border border-input rounded-lg text-white focus:border-primary focus:outline-none transition-colors appearance-none"
                    >
                      <option
                        v-for="curr in currencies"
                        :key="curr.value"
                        :value="curr.value"
                        class="bg-card py-2"
                      >
                        {{ curr.label }}
                      </option>
                    </select>
                    <Icon
                      name="ph:caret-down"
                      class="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Кнопка сохранения региональных настроек -->
            <div class="flex justify-end">
              <button
                @click="saveName"
                :disabled="isSavingName"
                :class="[
                  'px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center space-x-2',
                  isSavingName
                    ? 'bg-primary/50 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 cursor-pointer',
                ]"
              >
                <Icon
                  v-if="isSavingName"
                  name="ph:circle-notch"
                  class="w-5 h-5 animate-spin"
                />
                <Icon v-else name="ph:check" class="w-5 h-5" />
                <span>{{
                  isSavingName ? "Сохранение..." : "Сохранить настройки"
                }}</span>
              </button>
            </div>
          </div>

          <!-- Безопасность -->
          <div v-else-if="activeTab === 'security'" class="space-y-6">
            <div
              class="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div class="px-6 py-5 border-b border-border">
                <h2
                  class="text-xl font-semibold text-white flex items-center space-x-2"
                >
                  <Icon name="ph:lock" class="w-6 h-6 text-primary" />
                  <span>Смена пароля</span>
                </h2>
              </div>
              <div class="p-6 space-y-6">
                <!-- Текущий пароль -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    Текущий пароль <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      v-model="passwordData.currentPassword"
                      :type="showCurrentPassword ? 'text' : 'password'"
                      class="w-full px-4 py-3 bg-background border border-input rounded-lg text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      @click="showCurrentPassword = !showCurrentPassword"
                      type="button"
                      class="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                    >
                      <Icon
                        :name="showCurrentPassword ? 'ph:eye-slash' : 'ph:eye'"
                        class="w-5 h-5"
                      />
                    </button>
                  </div>
                </div>

                <!-- Новый пароль -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    Новый пароль <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      v-model="passwordData.newPassword"
                      :type="showNewPassword ? 'text' : 'password'"
                      class="w-full px-4 py-3 bg-background border border-input rounded-lg text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors pr-12"
                      placeholder="Минимум 8 символов"
                      required
                    />
                    <button
                      @click="showNewPassword = !showNewPassword"
                      type="button"
                      class="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                    >
                      <Icon
                        :name="showNewPassword ? 'ph:eye-slash' : 'ph:eye'"
                        class="w-5 h-5"
                      />
                    </button>
                  </div>
                  <p class="mt-2 text-sm text-muted-foreground">
                    Пароль должен содержать минимум 8 символов
                  </p>
                </div>

                <!-- Подтверждение -->
                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    Подтвердите пароль <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      v-model="passwordData.confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      class="w-full px-4 py-3 bg-background border border-input rounded-lg text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      @click="showConfirmPassword = !showConfirmPassword"
                      type="button"
                      class="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                    >
                      <Icon
                        :name="showConfirmPassword ? 'ph:eye-slash' : 'ph:eye'"
                        class="w-5 h-5"
                      />
                    </button>
                  </div>
                </div>

                <!-- Кнопка -->
                <div class="flex justify-end pt-2">
                  <button
                    @click="changePassword"
                    :disabled="isChangingPassword"
                    :class="[
                      'px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center space-x-2',
                      isChangingPassword
                        ? 'bg-primary/50 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary/90 cursor-pointer',
                    ]"
                  >
                    <Icon
                      v-if="isChangingPassword"
                      name="ph:circle-notch"
                      class="w-5 h-5 animate-spin"
                    />
                    <Icon v-else name="ph:key" class="w-5 h-5" />
                    <span>{{
                      isChangingPassword ? "Изменение..." : "Изменить пароль"
                    }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Уведомления -->
          <div v-else-if="activeTab === 'notifications'">
            <div
              class="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div class="px-6 py-5 border-b border-border">
                <h2
                  class="text-xl font-semibold text-white flex items-center space-x-2"
                >
                  <Icon name="ph:bell" class="w-6 h-6 text-primary" />
                  <span>Настройки уведомлений</span>
                </h2>
              </div>
              <div class="p-12 text-center">
                <div
                  class="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4"
                >
                  <Icon name="ph:bell-ringing" class="w-8 h-8 text-primary" />
                </div>
                <h3 class="text-lg font-semibold text-white mb-2">
                  Раздел в разработке
                </h3>
                <p class="text-muted-foreground max-w-md mx-auto">
                  Мы активно работаем над этим разделом. Скоро здесь появятся
                  настройки уведомлений.
                </p>
              </div>
            </div>
          </div>

          <!-- Рабочее пространство -->
          <div v-else-if="activeTab === 'workspace'">
            <div
              class="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div class="px-6 py-5 border-b border-border">
                <h2
                  class="text-xl font-semibold text-white flex items-center space-x-2"
                >
                  <Icon name="ph:desktop" class="w-6 h-6 text-primary" />
                  <span>Рабочее пространство</span>
                </h2>
              </div>
              <div class="p-12 text-center">
                <div
                  class="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4"
                >
                  <Icon name="ph:layout" class="w-8 h-8 text-primary" />
                </div>
                <h3 class="text-lg font-semibold text-white mb-2">
                  Раздел в разработке
                </h3>
                <p class="text-muted-foreground max-w-md mx-auto">
                  Мы активно работаем над этим разделом. Скоро здесь появятся
                  настройки рабочего пространства.
                </p>
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
