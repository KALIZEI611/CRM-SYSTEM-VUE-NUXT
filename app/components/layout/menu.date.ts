export interface IMenuItem {
  name: string;
  url: string;
}

export const MENU_DATA: IMenuItem[] = [
  {
    name: "Home",
    url: "/",
  },
  {
    name: "Products",
    url: "/products",
  },
  {
    name: "Payments",
    url: "/payments"
  },
  {
    name: "Orders",
    url: "/orders"
  },
  {
    name: "Customers",
    url: "/customers",
  },
  {
    name: "Feedback",
    url: "/feedback",
  },
  {
    name: "Settings",
    url: "/settings",
  },
  {
    name: "Help center",
    url: "/help",
  },
];
