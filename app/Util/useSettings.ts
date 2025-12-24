import { ref, computed, type Ref } from "vue";
import type {
  NotificationSettings,
  SystemSettings,
} from "~/types/setting.types";
import { userSettingsApi } from "~/api/userSettings.api";
import { useAuthStore } from "~/stores/auth.store";

export function useSettings() {
  const authStore = useAuthStore();
  const activeTab: Ref<string> = ref("notifications");
  const isLoading: Ref<boolean> = ref(false);
  const isSaving: Ref<boolean> = ref(false);
  const showTestModal: Ref<boolean> = ref(false);
  const testResult: Ref<"success" | "error" | null> = ref(null);
  const webhookUrl: Ref<string> = ref("");
  const webhookSecret: Ref<string> = ref("");

  const notificationSettings: Ref<NotificationSettings> = ref(
    getDefaultNotificationSettings()
  );
  const systemSettings: Ref<SystemSettings> = ref(getDefaultSystemSettings());

  function getDefaultNotificationSettings(): NotificationSettings {
    return {
      emailNotifications: {
        enabled: true,
        dailyDigest: true,
        weeklyReport: true,
        newLead: true,
        newTask: true,
        taskReminder: true,
        paymentReceived: true,
        systemAlerts: true,
      },
      pushNotifications: {
        enabled: true,
        browserPermission: false,
        newLead: true,
        newMessage: true,
        taskDeadline: true,
        urgentTask: true,
      },
      webhookSettings: {
        enabled: false,
        events: {
          leadCreated: true,
          leadUpdated: false,
          taskCreated: true,
          taskCompleted: false,
          paymentReceived: true,
          userRegistered: false,
        },
        retryCount: 3,
        timeout: 5000,
      },
    };
  }

  function getDefaultSystemSettings(): SystemSettings {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: "ru",
      dateFormat: "dd.mm.yyyy",
      currency: "RUB",
      theme: "dark",
      autoSave: true,
      sessionTimeout: 30,
      twoFactorAuth: false,
      dataExport: true,
      apiAccess: false,
    };
  }

  const hasPushPermission = computed(() => {
    return "Notification" in window && Notification.permission === "granted";
  });

  const notificationSummary = computed(() => {
    const settings = notificationSettings.value;
    const enabledTypes: string[] = [];

    if (settings.emailNotifications.enabled) enabledTypes.push("Email");
    if (settings.pushNotifications.enabled && hasPushPermission.value)
      enabledTypes.push("Push");
    if (settings.webhookSettings.enabled) enabledTypes.push("Webhook");

    return enabledTypes.length > 0
      ? `Включено: ${enabledTypes.join(", ")}`
      : "Все уведомления отключены";
  });

  const loadSettings = async (): Promise<void> => {
    if (!authStore.isAuth) return;

    isLoading.value = true;
    try {
      const savedSettings = await userSettingsApi.loadSettings();
      if (savedSettings) {
        const settings = {
          emailEnabled: savedSettings.emailEnabled,
          emailDaily: savedSettings.emailDaily,
          emailWeekly: savedSettings.emailWeekly,
          emailNewLead: savedSettings.emailNewLead,
          emailNewTask: savedSettings.emailNewTask,
          emailPayment: savedSettings.emailPayment,
          emailAddress: savedSettings.emailAddress,
          pushEnabled: savedSettings.pushEnabled,
          pushNewLead: savedSettings.pushNewLead,
          pushNewMessage: savedSettings.pushNewMessage,
          pushTaskDeadline: savedSettings.pushTaskDeadline,
          pushUrgentTask: savedSettings.pushUrgentTask,
        };

        notificationSettings.value = mapToNotificationSettings(settings);
      }
    } catch (error) {
      console.error("Ошибка загрузки настроек:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const saveNotificationSettings = async (): Promise<void> => {
    if (!authStore.isAuth) {
      alert("Для сохранения настроек необходимо войти в систему");
      return;
    }

    isSaving.value = true;
    try {
      const settingsToSave = mapFromNotificationSettings(
        notificationSettings.value
      );
      await userSettingsApi.saveSettings(settingsToSave);

      alert("Настройки уведомлений сохранены!");
    } catch (error) {
      console.error("Ошибка сохранения настроек:", error);
      alert("Не удалось сохранить настройки");
    } finally {
      isSaving.value = false;
    }
  };

  const saveSystemSettings = async (): Promise<void> => {
    isSaving.value = true;
    try {
      const settingsToSave = {
        systemSettings: systemSettings.value,
      };
      await userSettingsApi.saveSettings(settingsToSave);

      alert("Системные настройки сохранены!");
    } catch (error) {
      console.error("Ошибка сохранения системных настроек:", error);
      alert("Ошибка при сохранении настроек");
    } finally {
      isSaving.value = false;
    }
  };

  const toggleEmailSettings = (): void => {
    notificationSettings.value.emailNotifications.enabled =
      !notificationSettings.value.emailNotifications.enabled;
  };

  const togglePushSettings = async (): Promise<void> => {
    if (!notificationSettings.value.pushNotifications.enabled) {
      const granted = await requestPushPermission();
      if (granted) {
        notificationSettings.value.pushNotifications.enabled = true;
        notificationSettings.value.pushNotifications.browserPermission = true;
      }
    } else {
      notificationSettings.value.pushNotifications.enabled = false;
    }
  };

  const toggleWebhookSettings = (): void => {
    notificationSettings.value.webhookSettings.enabled =
      !notificationSettings.value.webhookSettings.enabled;
  };

  const enableAllEmailNotifications = (): void => {
    const emailSettings = notificationSettings.value.emailNotifications;
    emailSettings.dailyDigest = true;
    emailSettings.weeklyReport = true;
    emailSettings.newLead = true;
    emailSettings.newTask = true;
    emailSettings.taskReminder = true;
    emailSettings.paymentReceived = true;
    emailSettings.systemAlerts = true;
  };

  const disableAllEmailNotifications = (): void => {
    const emailSettings = notificationSettings.value.emailNotifications;
    emailSettings.dailyDigest = false;
    emailSettings.weeklyReport = false;
    emailSettings.newLead = false;
    emailSettings.newTask = false;
    emailSettings.taskReminder = false;
    emailSettings.paymentReceived = false;
    emailSettings.systemAlerts = false;
  };

  const enableAllPushNotifications = (): void => {
    const pushSettings = notificationSettings.value.pushNotifications;
    pushSettings.newLead = true;
    pushSettings.newMessage = true;
    pushSettings.taskDeadline = true;
    pushSettings.urgentTask = true;
  };

  const disableAllPushNotifications = (): void => {
    const pushSettings = notificationSettings.value.pushNotifications;
    pushSettings.newLead = false;
    pushSettings.newMessage = false;
    pushSettings.taskDeadline = false;
    pushSettings.urgentTask = false;
  };

  const enableAllWebhookEvents = (): void => {
    const events = notificationSettings.value.webhookSettings.events;
    events.leadCreated = true;
    events.leadUpdated = true;
    events.taskCreated = true;
    events.taskCompleted = true;
    events.paymentReceived = true;
    events.userRegistered = true;
  };

  const disableAllWebhookEvents = (): void => {
    const events = notificationSettings.value.webhookSettings.events;
    events.leadCreated = false;
    events.leadUpdated = false;
    events.taskCreated = false;
    events.taskCompleted = false;
    events.paymentReceived = false;
    events.userRegistered = false;
  };

  const openTestModal = (): void => {
    if (!notificationSettings.value.webhookSettings.url) {
      alert("Пожалуйста, сначала укажите URL для webhook");
      return;
    }

    webhookUrl.value = notificationSettings.value.webhookSettings.url;
    webhookSecret.value =
      notificationSettings.value.webhookSettings.secret || "";
    showTestModal.value = true;
    testResult.value = null;
  };

  const closeTestModal = (): void => {
    showTestModal.value = false;
    webhookUrl.value = "";
    webhookSecret.value = "";
    testResult.value = null;
  };

  const testWebhook = async (): Promise<void> => {
    if (!webhookUrl.value) {
      alert("Пожалуйста, укажите URL для тестирования");
      return;
    }

    testResult.value = null;

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const success = Math.random() > 0.3;

      testResult.value = success ? "success" : "error";

      if (success) {
        alert(
          "Webhook успешно протестирован! Сервер вернул положительный ответ."
        );
      } else {
        alert("Ошибка при тестировании webhook. Сервер вернул ошибку.");
      }
    } catch (error) {
      console.error("Error testing webhook:", error);
      testResult.value = "error";
      alert(
        "Ошибка при тестировании webhook. Проверьте URL и сетевые настройки."
      );
    }
  };

  const requestPushPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      console.warn("Браузер не поддерживает push-уведомления");
      return false;
    }

    if (Notification.permission === "granted") {
      notificationSettings.value.pushNotifications.browserPermission = true;
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === "granted";

      if (granted) {
        notificationSettings.value.pushNotifications.browserPermission = true;
        alert("Разрешение на push-уведомления получено!");
      } else {
        alert(
          "Разрешение на push-уведомления не получено. Проверьте настройки браузера."
        );
      }

      return granted;
    } catch (error) {
      console.error("Error requesting push permission:", error);
      return false;
    }
  };

  const resetToDefaults = async (): Promise<void> => {
    if (
      !confirm(
        "Вы уверены, что хотите сбросить все настройки к значениям по умолчанию? Это действие нельзя отменить."
      )
    ) {
      return;
    }

    isLoading.value = true;
    try {
      await userSettingsApi.deleteSettings();

      notificationSettings.value = getDefaultNotificationSettings();
      systemSettings.value = getDefaultSystemSettings();

      alert("Настройки сброшены к значениям по умолчанию!");
    } catch (error) {
      console.error("Error resetting settings:", error);
      alert("Ошибка при сбросе настроек");
    } finally {
      isLoading.value = false;
    }
  };

  function mapToNotificationSettings(data: any): NotificationSettings {
    return {
      emailNotifications: {
        enabled: data.emailEnabled ?? true,
        dailyDigest: data.emailDaily ?? true,
        weeklyReport: data.emailWeekly ?? true,
        newLead: data.emailNewLead ?? true,
        newTask: data.emailNewTask ?? true,
        taskReminder: data.emailNewTask ?? true,
        paymentReceived: data.emailPayment ?? true,
        systemAlerts: true,
      },
      pushNotifications: {
        enabled: data.pushEnabled ?? false,
        browserPermission: false,
        newLead: data.pushNewLead ?? true,
        newMessage: data.pushNewMessage ?? true,
        taskDeadline: data.pushTaskDeadline ?? true,
        urgentTask: data.pushUrgentTask ?? true,
      },
      webhookSettings: {
        enabled: false,
        events: {
          leadCreated: true,
          leadUpdated: false,
          taskCreated: true,
          taskCompleted: false,
          paymentReceived: true,
          userRegistered: false,
        },
        retryCount: 3,
        timeout: 5000,
      },
    };
  }

  function mapFromNotificationSettings(settings: NotificationSettings): any {
    return {
      emailEnabled: settings.emailNotifications.enabled,
      emailDaily: settings.emailNotifications.dailyDigest,
      emailWeekly: settings.emailNotifications.weeklyReport,
      emailNewLead: settings.emailNotifications.newLead,
      emailNewTask: settings.emailNotifications.newTask,
      emailPayment: settings.emailNotifications.paymentReceived,
      emailAddress: "",
      pushEnabled: settings.pushNotifications.enabled,
      pushNewLead: settings.pushNotifications.newLead,
      pushNewMessage: settings.pushNotifications.newMessage,
      pushTaskDeadline: settings.pushNotifications.taskDeadline,
      pushUrgentTask: settings.pushNotifications.urgentTask,
    };
  }

  return {
    activeTab,
    isLoading,
    isSaving,
    showTestModal,
    testResult,
    webhookUrl,
    webhookSecret,
    notificationSettings,
    systemSettings,
    hasPushPermission,
    notificationSummary,
    loadSettings,
    saveNotificationSettings,
    saveSystemSettings,
    toggleEmailSettings,
    togglePushSettings,
    toggleWebhookSettings,
    enableAllEmailNotifications,
    disableAllEmailNotifications,
    enableAllPushNotifications,
    disableAllPushNotifications,
    enableAllWebhookEvents,
    disableAllWebhookEvents,
    openTestModal,
    closeTestModal,
    testWebhook,
    requestPushPermission,
    resetToDefaults,
  };
}

export type UseSettingsReturn = ReturnType<typeof useSettings>;
