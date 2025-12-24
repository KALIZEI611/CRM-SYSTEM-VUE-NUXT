// Типы для настроек уведомлений
export interface NotificationSettings {
  $id?: string
  userId: string
  emailNotifications: EmailSettings
  pushNotifications: PushSettings
  webhookSettings: WebhookSettings
  createdAt?: string
  updatedAt?: string
}

export interface EmailSettings {
  enabled: boolean
  dailyDigest: boolean
  weeklyReport: boolean
  newLead: boolean
  newTask: boolean
  taskReminder: boolean
  paymentReceived: boolean
  systemAlerts: boolean
  customEmail?: string // Альтернативный email
}

export interface PushSettings {
  enabled: boolean
  browserPermission: boolean
  newLead: boolean
  newMessage: boolean
  taskDeadline: boolean
  urgentTask: boolean
}

export interface WebhookSettings {
  enabled: boolean
  url?: string
  secret?: string
  events: WebhookEvents
  retryCount: number
  timeout: number
}

export interface WebhookEvents {
  leadCreated: boolean
  leadUpdated: boolean
  taskCreated: boolean
  taskCompleted: boolean
  paymentReceived: boolean
  userRegistered: boolean
}

export interface SystemSettings {
  $id?: string
  userId: string
  timezone: string
  language: string
  dateFormat: string
  currency: string
  theme: 'light' | 'dark' | 'auto'
  autoSave: boolean
  sessionTimeout: number
  twoFactorAuth: boolean
  dataExport: boolean
  apiAccess: boolean
  createdAt?: string
  updatedAt?: string
}

export interface IntegrationSettings {
  $id?: string
  userId: string
  googleCalendar: boolean
  googleCalendarId?: string
  slackIntegration: boolean
  slackWebhook?: string
  telegramBot: boolean
  telegramChatId?: string
  whatsappBusiness: boolean
  whatsappPhone?: string
  createdAt?: string
  updatedAt?: string
}