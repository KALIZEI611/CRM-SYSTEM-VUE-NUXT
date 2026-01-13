import { useAuthStore } from "~/stores/auth.store";
import { account } from "~/Util/appwrite";

export const useAuth = () => {
  const authStore = useAuthStore();

  const getUser = async () => {
    try {
      const user = await account.get();
      return user;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  };

  // Обновление имени (не требует пароля)
  const updateUserName = async (name: string) => {
    try {
      await account.updateName(name);

      // Обновляем данные в хранилище
      if (authStore.user) {
        authStore.user.name = name;
      }

      return true;
    } catch (error) {
      console.error("Error updating name:", error);
      throw error;
    }
  };

  // Обновление телефона (требует пароль)
  const updateUserPhone = async (phone: string, password: string) => {
    try {
      // В Appwrite 13.x.x метод updatePhone требует два параметра: phone и password
      await account.updatePhone(phone, password);

      // Обновляем данные в хранилище
      if (authStore.user) {
        authStore.user.phone = phone;
      }

      return true;
    } catch (error) {
      console.error("Error updating phone:", error);
      throw error;
    }
  };

  // Смена пароля
  const updatePassword = async (newPassword: string, oldPassword: string) => {
    try {
      await account.updatePassword(newPassword, oldPassword);
      return true;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  };

  return {
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isLoading: computed(() => authStore.isLoading),
    getUser,
    updateUserName,
    updateUserPhone,
    updatePassword,
  };
};
