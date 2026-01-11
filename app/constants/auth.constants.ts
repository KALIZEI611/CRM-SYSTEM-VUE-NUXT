export const PASSWORD_MIN_LENGTH = 6;
export const NAME_MIN_LENGTH = 2;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const DEMO_ACCOUNTS = {
  admin: {
    email: "admin@demo.com",
    password: "demo123",
    name: "Администратор"
  },
  user: {
    email: "user@demo.com",
    password: "demo123",
    name: "Пользователь"
  }
} as const;