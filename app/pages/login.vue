<script setup lang="ts">
import { useSeoMeta } from "#app";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useIsLoadingStore, useAuthStore } from "~/stores/auth.store";
import { useAuthForm } from "~/Util/useAuthForm";
import { AuthService } from "~/services/auth.service";
import { DEMO_ACCOUNTS } from "~/constants/auth.constants";

useSeoMeta({
  title: "Авторизация | CRM System",
});

const router = useRouter();
const isLoadingStore = useIsLoadingStore();
const authStore = useAuthStore();

const currentYear = computed(() => new Date().getFullYear());

const showLoginSuggestion = ref(false);

const {
  isLoginMode,
  loginForm,
  registerForm,
  errors,
  clearErrors,
  toggleMode,
  setErrors,
} = useAuthForm();

const showErrorAlert = (message: string) => {
  const cleanMessage = message
    .replace(/[❌⚠️🔒📧👤⏳🚫🌐⚙️😔🎉🔄✅]/g, "")
    .trim();

  alert(cleanMessage || "Произошла ошибка");
};

const showSuccessAlert = (message: string) => {
  const cleanMessage = message.replace(/[✅🎉🔄]/g, "").trim();

  if (cleanMessage) {
    alert(cleanMessage);
  }
};

const handleLogin = async () => {
  try {
    isLoadingStore.set(true);
    clearErrors("login");

    const response = await AuthService.login(loginForm);

    if (response.success && response.user) {
      showSuccessAlert(`✅ Добро пожаловать, ${response.user.name}!`);

      authStore.set({
        email: response.user.email,
        name: response.user.name,
        status: response.user.status,
      });

      await router.push("/");
    } else if (response.errors) {
      setErrors("login", response.errors);

      if (response.message) {
        showErrorAlert(response.message);
      } else if (response.errors.form) {
        showErrorAlert(response.errors.form);
      } else {
        showErrorAlert("Ошибка при входе. Проверьте введенные данные.");
      }
    }
  } catch (error) {
    console.error("Ошибка входа:", error);
    showErrorAlert(
      "Произошла непредвиденная ошибка при входе. Попробуйте снова."
    );
  } finally {
    isLoadingStore.set(false);
  }
};

const handleRegister = async () => {
  try {
    isLoadingStore.set(true);
    clearErrors("register");
    showLoginSuggestion.value = false;

    const response = await AuthService.register(registerForm);

    if (response.success && response.user) {
      showSuccessAlert(
        `🎉 Регистрация успешна! Добро пожаловать, ${response.user.name}!`
      );

      authStore.set({
        email: response.user.email,
        name: response.user.name,
        status: response.user.status,
      });

      await router.push("/");
    } else if (response.errors) {
      setErrors("register", response.errors);

      if (response.message) {
        showErrorAlert(response.message);
      } else if (response.errors.form) {
        showErrorAlert(response.errors.form);
      } else {
        showErrorAlert("Ошибка при регистрации. Проверьте введенные данные.");
      }

      if (
        response.errors.form?.includes("уже существует") ||
        response.errors.email
      ) {
        showLoginSuggestion.value = true;
        if (confirm("У вас уже есть аккаунт. Хотите войти?")) {
          toggleMode();
          loginForm.email = registerForm.email;
        }
      }
    }
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    showErrorAlert(
      "Произошла непредвиденная ошибка при регистрации. Попробуйте снова."
    );
  } finally {
    isLoadingStore.set(false);
  }
};

const useDemoAccount = (type: keyof typeof DEMO_ACCOUNTS) => {
  const demo = DEMO_ACCOUNTS[type];
  loginForm.email = demo.email;
  loginForm.password = demo.password;
  clearErrors("login");

  alert(
    `Демо-данные заполнены для ${demo.name}. Нажмите "Войти" для продолжения.`
  );

  if (!isLoginMode.value) {
    toggleMode();
  }
};

const handleToggleMode = () => {
  clearErrors(isLoginMode.value ? "login" : "register");
  showLoginSuggestion.value = false;
  toggleMode();
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen w-full">
    <div class="w-full max-w-md mx-4">
      <div class="bg-sidebar rounded-lg shadow-lg p-8">
        <div class="mb-8">
          <div class="flex border-b border-gray-600">
            <button
              @click="handleToggleMode"
              :class="[
                'flex-1 py-3 font-medium text-lg transition-colors cursor-pointer',
                isLoginMode
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300',
              ]"
              :disabled="isLoadingStore.isLoading"
            >
              Вход
            </button>
            <button
              @click="handleToggleMode"
              :class="[
                'flex-1 py-3 font-medium text-lg transition-colors cursor-pointer',
                !isLoginMode
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300',
              ]"
              :disabled="isLoadingStore.isLoading"
            >
              Регистрация
            </button>
          </div>
        </div>

        <div v-if="isLoginMode">
          <h2 class="text-2xl font-bold text-center mb-6 text-white">
            Вход в систему
          </h2>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label class="block font-medium text-gray-300 mb-1">
                Email
              </label>
              <UiInput
                v-model="loginForm.email"
                type="email"
                placeholder="Введите ваш email"
                :class="{
                  'border-red-500': errors.login.email,
                  'border-green-500':
                    loginForm.email &&
                    !errors.login.email &&
                    loginForm.email.includes('@'),
                }"
                @input="() => clearErrors('login')"
                :disabled="isLoadingStore.isLoading"
              />
              <p v-if="errors.login.email" class="mt-1 text-sm text-red-400">
                {{ errors.login.email }}
              </p>
            </div>

            <div>
              <label class="block font-medium text-gray-300 mb-1">
                Пароль
              </label>
              <UiInput
                v-model="loginForm.password"
                type="password"
                placeholder="Введите ваш пароль"
                :class="{
                  'border-red-500': errors.login.password,
                  'border-green-500':
                    loginForm.password &&
                    !errors.login.password &&
                    loginForm.password.length >= 6,
                }"
                @input="() => clearErrors('login')"
                :disabled="isLoadingStore.isLoading"
              />
              <p v-if="errors.login.password" class="mt-1 text-sm text-red-400">
                {{ errors.login.password }}
              </p>
            </div>
            <UiButton
              type="submit "
              class="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              :disabled="isLoadingStore.isLoading"
            >
              <template v-if="isLoadingStore.isLoading">
                <span class="flex items-center justify-center">
                  <svg
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Вход...
                </span>
              </template>
              <template v-else> Войти </template>
            </UiButton>
          </form>

          <div class="mt-8 pt-6 border-t border-gray-600">
            <p class="text-gray-400 text-center mb-4">Демо-доступ:</p>
            <div class="flex gap-3">
              <UiButton
                type="button"
                variant="outline"
                class="flex-1 text-sm border-gray-600 text-gray-300 hover:border-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                @click="() => useDemoAccount('admin')"
                :disabled="isLoadingStore.isLoading"
              >
                Админ
              </UiButton>
              <UiButton
                type="button"
                variant="outline"
                class="flex-1 text-sm border-gray-600 text-gray-300 hover:border-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                @click="() => useDemoAccount('user')"
                :disabled="isLoadingStore.isLoading"
              >
                Пользователь
              </UiButton>
            </div>
          </div>
        </div>

        <div v-else>
          <h2 class="text-2xl font-bold text-center mb-6 text-white">
            Создать аккаунт
          </h2>

          <form @submit.prevent="handleRegister" class="space-y-4">
            <div>
              <label class="block font-medium text-gray-300 mb-1"> Имя </label>
              <UiInput
                v-model="registerForm.name"
                type="text"
                placeholder="Введите ваше имя"
                :class="{
                  'border-red-500': errors.register.name,
                  'border-green-500':
                    registerForm.name &&
                    !errors.register.name &&
                    registerForm.name.length >= 2,
                }"
                @input="
                  () => {
                    clearErrors('register');
                    showLoginSuggestion = false;
                  }
                "
                :disabled="isLoadingStore.isLoading"
              />
              <p v-if="errors.register.name" class="mt-1 text-sm text-red-400">
                {{ errors.register.name }}
              </p>
            </div>
            <div>
              <label class="block font-medium text-gray-300 mb-1">
                Email
              </label>
              <UiInput
                v-model="registerForm.email"
                type="email"
                placeholder="Введите ваш email"
                :class="{
                  'border-red-500': errors.register.email,
                  'border-green-500':
                    registerForm.email &&
                    !errors.register.email &&
                    registerForm.email.includes('@'),
                }"
                @input="
                  () => {
                    clearErrors('register');
                    showLoginSuggestion = false;
                  }
                "
                :disabled="isLoadingStore.isLoading"
              />
              <p v-if="errors.register.email" class="mt-1 text-sm text-red-400">
                {{ errors.register.email }}
              </p>
            </div>
            <div>
              <label class="block font-medium text-gray-300 mb-1">
                Пароль
                <span class="text-xs text-gray-400"> (минимум 8 символов)</span>
              </label>
              <UiInput
                v-model="registerForm.password"
                type="password"
                placeholder="Создайте пароль"
                :class="{
                  'border-red-500': errors.register.password,
                  'border-green-500':
                    registerForm.password &&
                    !errors.register.password &&
                    registerForm.password.length >= 6,
                }"
                @input="
                  () => {
                    clearErrors('register');
                    showLoginSuggestion = false;
                  }
                "
                :disabled="isLoadingStore.isLoading"
              />
              <p
                v-if="errors.register.password"
                class="mt-1 text-sm text-red-400"
              >
                {{ errors.register.password }}
              </p>
            </div>
            <div>
              <label class="block font-medium text-gray-300 mb-1">
                Подтвердите пароль
              </label>
              <UiInput
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="Повторите пароль"
                :class="{
                  'border-red-500': errors.register.confirmPassword,
                  'border-green-500':
                    registerForm.confirmPassword &&
                    !errors.register.confirmPassword &&
                    registerForm.password === registerForm.confirmPassword,
                }"
                @input="
                  () => {
                    clearErrors('register');
                    showLoginSuggestion = false;
                  }
                "
                :disabled="isLoadingStore.isLoading"
              />
              <p
                v-if="errors.register.confirmPassword"
                class="mt-1 text-sm text-red-400"
              >
                {{ errors.register.confirmPassword }}
              </p>
            </div>

            <UiButton
              type="submit"
              class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              :disabled="isLoadingStore.isLoading"
            >
              <template v-if="isLoadingStore.isLoading">
                <span class="flex items-center justify-center">
                  <svg
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Регистрация...
                </span>
              </template>
              <template v-else> Зарегистрироваться </template>
            </UiButton>
          </form>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-600 text-center">
          <p class="text-gray-400">
            {{ isLoginMode ? "Нет аккаунта?" : "Уже есть аккаунт?" }}
            <button
              @click="handleToggleMode"
              class="ml-1 text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
              :disabled="isLoadingStore.isLoading"
            >
              {{ isLoginMode ? "Зарегистрируйтесь" : "Войдите" }}
            </button>
          </p>
        </div>
      </div>

      <div class="mt-6 text-center text-sm text-gray-500">
        <p>CRM System © {{ currentYear }}. Все права защищены.</p>
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
