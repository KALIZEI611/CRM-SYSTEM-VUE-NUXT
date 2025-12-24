import { ref, computed, type Ref } from 'vue'
import type { NotificationSettings, SystemSettings } from '~/types/setting.types'

export function useSettings() {
  // Реактивные данные
  const activeTab: Ref<string> = ref('notifications')
  const isLoading: Ref<boolean> = ref(false)
  const isSaving: Ref<boolean> = ref(false)
  const showTestModal: Ref<boolean> = ref(false)
  const testResult: Ref<'success' | 'error' | null> = ref(null)
  const webhookUrl: Ref<string> = ref('')
  const webhookSecret: Ref<string> = ref('')
  
  // Данные настроек
  const notificationSettings: Ref<NotificationSettings> = ref(getDefaultNotificationSettings())
  const systemSettings: Ref<SystemSettings> = ref(getDefaultSystemSettings())

  // Загрузка сохраненных настроек
  const loadSavedSettings = (): void => {
    isLoading.value = true
    
    try {
      // Загружаем из localStorage
      const savedNotifications = localStorage.getItem('crm_notification_settings')
      const savedSystem = localStorage.getItem('crm_system_settings')
      
      if (savedNotifications) {
        notificationSettings.value = {
          ...notificationSettings.value,
          ...JSON.parse(savedNotifications)
        }
      }
      
      if (savedSystem) {
        systemSettings.value = {
          ...systemSettings.value,
          ...JSON.parse(savedSystem)
        }
      }
    } catch (error) {
      console.error('Error loading saved settings:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Настройки по умолчанию
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
        systemAlerts: true
      },
      pushNotifications: {
        enabled: true,
        browserPermission: false,
        newLead: true,
        newMessage: true,
        taskDeadline: true,
        urgentTask: true
      },
      webhookSettings: {
        enabled: false,
        events: {
          leadCreated: true,
          leadUpdated: false,
          taskCreated: true,
          taskCompleted: false,
          paymentReceived: true,
          userRegistered: false
        },
        retryCount: 3,
        timeout: 5000
      }
    }
  }

  function getDefaultSystemSettings(): SystemSettings {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: 'ru',
      dateFormat: 'dd.mm.yyyy',
      currency: 'RUB',
      theme: 'dark',
      autoSave: true,
      sessionTimeout: 30,
      twoFactorAuth: false,
      dataExport: true,
      apiAccess: false
    }
  }

  // Вычисляемые свойства
  const hasPushPermission = computed(() => {
    return 'Notification' in window && Notification.permission === 'granted'
  })

  const notificationSummary = computed(() => {
    const settings = notificationSettings.value
    const enabledTypes: string[] = []
    
    if (settings.emailNotifications.enabled) enabledTypes.push('Email')
    if (settings.pushNotifications.enabled && hasPushPermission.value) enabledTypes.push('Push')
    if (settings.webhookSettings.enabled) enabledTypes.push('Webhook')
    
    return enabledTypes.length > 0 
      ? `Включено: ${enabledTypes.join(', ')}`
      : 'Все уведомления отключены'
  })

  // Методы
  const saveNotificationSettings = async (): Promise<void> => {
    isSaving.value = true
    try {
      // Сохраняем в localStorage
      localStorage.setItem('crm_notification_settings', JSON.stringify(notificationSettings.value))
      
      // Имитируем задержку сервера
      await new Promise(resolve => setTimeout(resolve, 500))
      
      alert('Настройки уведомлений сохранены!')
    } catch (error) {
      console.error('Error saving notification settings:', error)
      alert('Ошибка при сохранении настроек')
    } finally {
      isSaving.value = false
    }
  }

  const saveSystemSettings = async (): Promise<void> => {
    isSaving.value = true
    try {
      // Сохраняем в localStorage
      localStorage.setItem('crm_system_settings', JSON.stringify(systemSettings.value))
      
      // Имитируем задержку сервера
      await new Promise(resolve => setTimeout(resolve, 500))
      
      alert('Системные настройки сохранены!')
    } catch (error) {
      console.error('Error saving system settings:', error)
      alert('Ошибка при сохранении настроек')
    } finally {
      isSaving.value = false
    }
  }

  const toggleEmailSettings = (): void => {
    notificationSettings.value.emailNotifications.enabled = 
      !notificationSettings.value.emailNotifications.enabled
  }

  const togglePushSettings = async (): Promise<void> => {
    if (!notificationSettings.value.pushNotifications.enabled) {
      // Включаем push - запрашиваем разрешение
      const granted = await requestPushPermission()
      if (granted) {
        notificationSettings.value.pushNotifications.enabled = true
        notificationSettings.value.pushNotifications.browserPermission = true
      }
    } else {
      // Отключаем push
      notificationSettings.value.pushNotifications.enabled = false
    }
  }

  const toggleWebhookSettings = (): void => {
    notificationSettings.value.webhookSettings.enabled = 
      !notificationSettings.value.webhookSettings.enabled
  }

  const enableAllEmailNotifications = (): void => {
    const emailSettings = notificationSettings.value.emailNotifications
    emailSettings.dailyDigest = true
    emailSettings.weeklyReport = true
    emailSettings.newLead = true
    emailSettings.newTask = true
    emailSettings.taskReminder = true
    emailSettings.paymentReceived = true
    emailSettings.systemAlerts = true
  }

  const disableAllEmailNotifications = (): void => {
    const emailSettings = notificationSettings.value.emailNotifications
    emailSettings.dailyDigest = false
    emailSettings.weeklyReport = false
    emailSettings.newLead = false
    emailSettings.newTask = false
    emailSettings.taskReminder = false
    emailSettings.paymentReceived = false
    emailSettings.systemAlerts = false
  }

  const enableAllPushNotifications = (): void => {
    const pushSettings = notificationSettings.value.pushNotifications
    pushSettings.newLead = true
    pushSettings.newMessage = true
    pushSettings.taskDeadline = true
    pushSettings.urgentTask = true
  }

  const disableAllPushNotifications = (): void => {
    const pushSettings = notificationSettings.value.pushNotifications
    pushSettings.newLead = false
    pushSettings.newMessage = false
    pushSettings.taskDeadline = false
    pushSettings.urgentTask = false
  }

  const enableAllWebhookEvents = (): void => {
    const events = notificationSettings.value.webhookSettings.events
    events.leadCreated = true
    events.leadUpdated = true
    events.taskCreated = true
    events.taskCompleted = true
    events.paymentReceived = true
    events.userRegistered = true
  }

  const disableAllWebhookEvents = (): void => {
    const events = notificationSettings.value.webhookSettings.events
    events.leadCreated = false
    events.leadUpdated = false
    events.taskCreated = false
    events.taskCompleted = false
    events.paymentReceived = false
    events.userRegistered = false
  }

  const openTestModal = (): void => {
    if (!notificationSettings.value.webhookSettings.url) {
      alert('Пожалуйста, сначала укажите URL для webhook')
      return
    }
    
    webhookUrl.value = notificationSettings.value.webhookSettings.url
    webhookSecret.value = notificationSettings.value.webhookSettings.secret || ''
    showTestModal.value = true
    testResult.value = null
  }

  const closeTestModal = (): void => {
    showTestModal.value = false
    webhookUrl.value = ''
    webhookSecret.value = ''
    testResult.value = null
  }

  const testWebhook = async (): Promise<void> => {
    if (!webhookUrl.value) {
      alert('Пожалуйста, укажите URL для тестирования')
      return
    }
    
    testResult.value = null
    
    try {
      // Имитируем тестирование webhook
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // В реальном приложении здесь был бы fetch запрос
      // const success = await fetch(webhookUrl.value, {...})
      const success = Math.random() > 0.3 // 70% успешных тестов
      
      testResult.value = success ? 'success' : 'error'
      
      if (success) {
        alert('Webhook успешно протестирован! Сервер вернул положительный ответ.')
      } else {
        alert('Ошибка при тестировании webhook. Сервер вернул ошибку.')
      }
    } catch (error) {
      console.error('Error testing webhook:', error)
      testResult.value = 'error'
      alert('Ошибка при тестировании webhook. Проверьте URL и сетевые настройки.')
    }
  }

  const requestPushPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Браузер не поддерживает push-уведомления')
      return false
    }
    
    if (Notification.permission === 'granted') {
      notificationSettings.value.pushNotifications.browserPermission = true
      return true
    }
    
    try {
      const permission = await Notification.requestPermission()
      const granted = permission === 'granted'
      
      if (granted) {
        notificationSettings.value.pushNotifications.browserPermission = true
        alert('Разрешение на push-уведомления получено!')
      } else {
        alert('Разрешение на push-уведомления не получено. Проверьте настройки браузера.')
      }
      
      return granted
    } catch (error) {
      console.error('Error requesting push permission:', error)
      return false
    }
  }

  const exportSettings = (): void => {
    const data = {
      exportedAt: new Date().toISOString(),
      notificationSettings: notificationSettings.value,
      systemSettings: systemSettings.value
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crm_settings_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    alert('Настройки успешно экспортированы!')
  }

  const resetToDefaults = (): void => {
    if (!confirm('Вы уверены, что хотите сбросить все настройки к значениям по умолчанию? Это действие нельзя отменить.')) {
      return
    }
    
    isLoading.value = true
    try {
      // Удаляем сохраненные настройки
      localStorage.removeItem('crm_notification_settings')
      localStorage.removeItem('crm_system_settings')
      
      // Устанавливаем значения по умолчанию
      notificationSettings.value = getDefaultNotificationSettings()
      systemSettings.value = getDefaultSystemSettings()
      
      alert('Настройки сброшены к значениям по умолчанию!')
    } catch (error) {
      console.error('Error resetting settings:', error)
      alert('Ошибка при сбросе настроек')
    } finally {
      isLoading.value = false
    }
  }

  // Инициализация
  const init = (): void => {
    loadSavedSettings()
  }

  return {
    // Реактивные данные
    activeTab,
    isLoading,
    isSaving,
    showTestModal,
    testResult,
    webhookUrl,
    webhookSecret,
    
    // Данные настроек
    notificationSettings,
    systemSettings,
    
    // Вычисляемые свойства
    hasPushPermission,
    notificationSummary,
    
    // Методы
    init,
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
    exportSettings,
    resetToDefaults
  }
}

export type UseSettingsReturn = ReturnType<typeof useSettings>