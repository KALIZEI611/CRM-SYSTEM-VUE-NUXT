export interface IMenuItem {
  name: string;
  url: string;
  icon: string;
}

export const MENU_DATA: IMenuItem[] = [
  {
    icon: "radix-icons:dashboard",
    name: "Домой",
    url: "/",
  },
  {
    name: "Продукты",
    icon: "ep:goods",
    url: "/products",
  },
  {
    name: "Платежи",
    icon: "ph:contactless-payment",
    url: "/payments",
  },
  {
    name: "Заказы",
    icon: "fluent:receipt-28-regular",
    url: "/orders",
  },
  {
    name: "Клиенты",
    icon: "mingcute:group-line",
    url: "/customers",
  },
  {
    name: "Обратная связь",
    icon: "fluent:person-feedback-48-regular",
    url: "/feedback",
  },
  {
    name: "Настройки",
    icon: "radix-icons:gear",
    url: "/settings",
  },
  {
    name: "Справочный центр",
    icon: "radix-icons:question-mark",
    url: "/help",
  },
];
