export interface IMenuItem {
  name: string;
  url: string;
  icon: string;
}

export const MENU_DATA: IMenuItem[] = [
  {
    icon: "radix-icons:dashboard",
    name: "Главная",
    url: "/",
  },
  {
    name: "Платежи",
    icon: "ph:contactless-payment",
    url: "/payments",
  },
  {
    name: "Клиенты",
    icon: "mingcute:group-line",
    url: "/customers",
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
