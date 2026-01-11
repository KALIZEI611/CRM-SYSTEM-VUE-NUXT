<script setup lang="ts">
import { useSeoMeta } from "#app";
import { useRouter } from "vue-router";
import { useIsLoadingStore, useAuthStore } from "~/stores/auth.store";
import { useAuthForm } from "~/Util/useAuthForm";
import { AuthService } from "~/services/auth.service";
import { DEMO_ACCOUNTS } from "~/constants/auth.constants";
import { AuthValidator } from "~/Util/validators";

useSeoMeta({
  title: "Авторизация",
});

const router = useRouter();
const isLoadingStore = useIsLoadingStore();
const authStore = useAuthStore();

// Используем композабл для управления формой
const {
  isLoginMode,
  loginForm,
  registerForm,
  errors,
  clearErrors,
  toggleMode,
  setErrors,
} = useAuthForm();

// Обработчик входа
const handleLogin = async () => {
  try {
    isLoadingStore.set(true);
    clearErrors("login");

    const response = await AuthService.login(loginForm);

    if (response.success && response.user) {
      authStore.set(response.user);
      await router.push("/");
    } else if (response.errors) {
      setErrors("login", response.errors);
    }
  } catch (error) {
    console.error("Login handler error:", error);
    setErrors("login", {
      form: "Произошла непредвиденная ошибка",
    });
  } finally {
    isLoadingStore.set(false);
  }
};

// Обработчик регистрации
const handleRegister = async () => {
  try {
    isLoadingStore.set(true);
    clearErrors("register");

    const response = await AuthService.register(registerForm);

    if (response.success && response.user) {
      authStore.set(response.user);
      await router.push("/");
    } else if (response.errors) {
      setErrors("register", response.errors);
    }
  } catch (error) {
    console.error("Register handler error:", error);
    setErrors("register", {
      form: "Произошла непредвиденная ошибка",
    });
  } finally {
    isLoadingStore.set(false);
  }
};

// Быстрый доступ к демо-аккаунтам
const useDemoAccount = (type: keyof typeof DEMO_ACCOUNTS) => {
  const demo = DEMO_ACCOUNTS[type];
  loginForm.email = demo.email;
  loginForm.password = demo.password;
  clearErrors("login");
};

const currentYear = computed(() => new Date().getFullYear());
</script>

<template>
  <div class="flex items-center justify-center min-h-screen w-full bg-gray-150">
    <div class="w-full max-w-md">
      <!-- Карточка авторизации -->
      <div class="bg-sidebar rounded-lg shadow-lg p-8">
        <!-- Заголовок с переключением режима -->
        <div class="mb-8">
          <div class="flex border-b">
            <button
              @click="toggleMode"
              :class="[
                'flex-1 py-3 font-medium text-lg transition-colors',
                isLoginMode
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-500',
              ]"
            >
              Вход
            </button>
            <button
              @click="toggleMode"
              :class="[
                'flex-1 py-3 font-medium text-lg transition-colors',
                !isLoginMode
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-500',
              ]"
            >
              Регистрация
            </button>
          </div>
        </div>

        <!-- Форма входа -->
        <div v-if="isLoginMode">
          <h2 class="text-2xl font-bold text-center mb-6">Вход в систему</h2>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <!-- Общая ошибка формы -->
            <div
              v-if="errors.login.form"
              class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
            >
              {{ errors.login.form }}
            </div>

            <!-- Поле email -->
            <div>
              <label class="block font-medium text-gray-400 mb-1"> Email </label>
              <UiInput
                v-model="loginForm.email"
                type="email"
                placeholder="Введите ваш email"
                :class="{ 'border-red-500': errors.login.email }"
                @input="() => clearErrors('login')"
              />
              <p v-if="errors.login.email" class="mt-1 text-sm text-red-600">
                {{ errors.login.email }}
              </p>
            </div>

            <!-- Поле пароля -->
            <div>
              <label class="block font-medium text-gray-400 mb-1"> Пароль </label>
              <UiInput
                v-model="loginForm.password"
                type="password"
                placeholder="Введите ваш пароль"
                :class="{ 'border-red-500': errors.login.password }"
                @input="() => clearErrors('login')"
              />
              <p v-if="errors.login.password" class="mt-1 text-sm text-red-600">
                {{ errors.login.password }}
              </p>
            </div>

            <!-- Кнопка входа -->
            <UiButton
              type="submit"
              class="w-full py-3 bg-green-600 text-white font-medium"
              :disabled="isLoadingStore.isLoading"
            >
              <span v-if="isLoadingStore.isLoading">Вход...</span>
              <span v-else>Войти</span>
            </UiButton>
          </form>

          <!-- Демо-аккаунты -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <p class="text-gray-400 text-center mb-3">Демо-доступ:</p>
            <div class="flex gap-2">
              <UiButton
                type="button"
                variant="outline"
                class="flex-1 hover:text-gray-600"
                @click="() => useDemoAccount('admin')"
              >
                Админ
              </UiButton>
              <UiButton
                type="button"
                variant="outline"
                class="flex-1 hover:text-gray-600"
                @click="() => useDemoAccount('user')"
              >
                Пользователь
              </UiButton>
            </div>
          </div>
        </div>

        <!-- Форма регистрации -->
        <div v-else>
          <h2 class="text-2xl font-bold text-center mb-6">Создать аккаунт</h2>

          <form @submit.prevent="handleRegister" class="space-y-4">
            <!-- Общая ошибка формы -->
            <div
              v-if="errors.register.form"
              class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
            >
              {{ errors.register.form }}
            </div>

            <!-- Поле имени -->
            <div>
              <label class="block font-medium text-gray-400 mb-1"> Имя </label>
              <UiInput
                v-model="registerForm.name"
                type="text"
                placeholder="Введите ваше имя"
                :class="{ 'border-red-500': errors.register.name }"
                @input="() => clearErrors('register')"
              />
              <p v-if="errors.register.name" class="mt-1 text-red-600">
                {{ errors.register.name }}
              </p>
            </div>

            <!-- Поле email -->
            <div>
              <label class="block font-medium text-gray-400 mb-1"> Email </label>
              <UiInput
                v-model="registerForm.email"
                type="email"
                placeholder="Введите ваш email"
                :class="{ 'border-red-500': errors.register.email }"
                @input="() => clearErrors('register')"
              />
              <p v-if="errors.register.email" class="mt-1 text-red-600">
                {{ errors.register.email }}
              </p>
            </div>

            <!-- Поле пароля -->
            <div>
              <label class="block font-medium text-gray-400 mb-1">
                Пароль
                <span class="text-xs text-gray-500"> (минимум 8 символов)</span>
              </label>
              <UiInput
                v-model="registerForm.password"
                type="password"
                placeholder="Создайте пароль"
                :class="{ 'border-red-500': errors.register.password }"
                @input="() => clearErrors('register')"
              />
              <p v-if="errors.register.password" class="mt-1 text-sm text-red-600">
                {{ errors.register.password }}
              </p>
            </div>

            <!-- Подтверждение пароля -->
            <div>
              <label class="block font-medium text-gray-400 mb-1">
                Подтвердите пароль
              </label>
              <UiInput
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="Повторите пароль"
                :class="{ 'border-red-500': errors.register.confirmPassword }"
                @input="() => clearErrors('register')"
              />
              <p v-if="errors.register.confirmPassword" class="mt-1 text-sm text-red-600">
                {{ errors.register.confirmPassword }}
              </p>
            </div>

            <!-- Кнопка регистрации -->
            <UiButton
              type="submit"
              class="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium"
              :disabled="isLoadingStore.isLoading"
            >
              <span v-if="isLoadingStore.isLoading">Регистрация...</span>
              <span v-else>Зарегистрироваться</span>
            </UiButton>
          </form>
        </div>

        <!-- Ссылка на переключение -->
        <div class="mt-6 text-center">
          <p class="text-gray-400">
            {{ isLoginMode ? "Нет аккаунта?" : "Уже есть аккаунт?" }}
            <button
              @click="toggleMode"
              class="text-blue-400 hover:text-blue-600 font-medium"
            >
              {{ isLoginMode ? "Зарегистрируйтесь" : "Войдите" }}
            </button>
          </p>
        </div>
      </div>

      <!-- Информация о системе -->
      <div class="mt-6 text-center text-sm text-gray-500">
        <p>CRM System © {{ currentYear }}. Все права защищены.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Анимация переключения форм */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
