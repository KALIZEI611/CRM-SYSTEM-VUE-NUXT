import { useQuery } from "@tanstack/vue-query";
import { DB } from "@/lib/appwrite";
import {
  COLLECTION_CUSTOMERS,
  COLLECTION_DEALS,
  DB_ID,
} from "~/constants/app.constants";
import { KANBAN_DATA } from "./kanban.data";
import type { IDeal } from "~/types/dealt.types";
import type { IColumn, ICard } from "./kanban.types";

export function useKanbarQuery() {
  return useQuery({
    queryKey: ["deals", "customers"],
    queryFn: async () => {
      const [dealsData, customersData] = await Promise.all([
        DB.listDocuments(DB_ID, COLLECTION_DEALS),
        DB.listDocuments(DB_ID, COLLECTION_CUSTOMERS),
      ]);

      return {
        deals: dealsData.documents,
        customers: customersData.documents,
      };
    },
    select(data) {
      // Явно указываем тип для newBoard
      const newBoard: IColumn[] = KANBAN_DATA.map((column) => ({
        ...column,
        items: [] as ICard[],
      }));

      const deals = data.deals as unknown as IDeal[];
      const customers = data.customers;

      // Создаем мапу customers для быстрого доступа
      const customersMap = new Map();
      customers.forEach((customer) => {
        customersMap.set(customer.$id, customer);
      });

      for (const deal of deals) {
        const column = newBoard.find((col) => col.id == deal.status);
        if (column) {
          const customer = customersMap.get(deal.customer);

          // Создаем объект с правильным типом
          const card: ICard = {
            $createdAt: deal.$createdAt,
            id: deal.$id,
            name: deal.name,
            price: deal.price,
            companyName: customer?.name || "No company",
            status: column.name,
          };

          column.items.push(card);
        }
      }

      return newBoard;
    },
  });
}
