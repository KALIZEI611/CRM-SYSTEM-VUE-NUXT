export interface IMenuItem {
  name: string;
  url: string;
}

export const MENU_DATA: IMenuItem[] = [
  {
    name: "Главная",
    url: "/",
  },
  {
    name: "Продукция",
    url: "/products",
  },
  {
    name: "Платежи",
    url: "/payments"
  },
  {
    name: "Заказы",
    url: "/orders"
  },
  {
    name: "Клиенты",
    url: "/customers",
  },
  {
    name: "Обратная связь",
    url: "/feedback",
  },
  {
    name: "Параметры",
    url: "/settings",
  },
  {
    name: "Справочный центр",
    url: "/help",
  },
];
