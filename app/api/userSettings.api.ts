import { DB, Query, ID } from "~/Util/appwrite";
import { useAuthStore } from "@/stores/auth.store";

const DATABASE_ID = "crm-base";
const COLLECTION_ID = "user_settings";

export interface UserSettings {
  userId: string;
  email: string;
  emailEnabled: boolean;
  emailDaily: boolean;
  emailWeekly: boolean;
  emailNewLead: boolean;
  emailNewTask: boolean;
  emailPayment: boolean;
  emailAddress: string;
  pushEnabled: boolean;
  pushNewLead: boolean;
  pushNewMessage: boolean;
  pushTaskDeadline: boolean;
  pushUrgentTask: boolean;
  lastUpdated: string;
}

export const userSettingsApi = {
  async saveSettings(settings: Partial<UserSettings>) {
    const authStore = useAuthStore();

    if (!authStore.isAuth) {
      throw new Error("Пользователь не авторизован");
    }

    try {
      const existingSettings = await DB.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal("userId", authStore.user.email)]
      );

      if (existingSettings.documents.length > 0) {
        const docId = existingSettings.documents[0].$id;
        return await DB.updateDocument(DATABASE_ID, COLLECTION_ID, docId, {
          ...settings,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        return await DB.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          ID.unique(),
          {
            userId: authStore.user.email,
            email: authStore.user.email,
            ...settings,
            lastUpdated: new Date().toISOString(),
          }
        );
      }
    } catch (error) {
      console.error("Ошибка сохранения настроек:", error);
      throw error;
    }
  },

  async loadSettings() {
    const authStore = useAuthStore();

    if (!authStore.isAuth) {
      return null;
    }

    try {
      const response = await DB.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.equal("userId", authStore.user.email),
      ]);

      if (response.documents.length > 0) {
        return response.documents[0] as UserSettings;
      }
      return null;
    } catch (error) {
      console.error("Ошибка загрузки настроек:", error);
      return null;
    }
  },

  async deleteSettings() {
    const authStore = useAuthStore();

    if (!authStore.isAuth) {
      return;
    }

    try {
      const existingSettings = await DB.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.equal("userId", authStore.user.email)]
      );

      if (existingSettings.documents.length > 0) {
        await DB.deleteDocument(
          DATABASE_ID,
          COLLECTION_ID,
          existingSettings.documents[0].$id
        );
      }
    } catch (error) {
      console.error("Ошибка удаления настроек:", error);
    }
  },
};
