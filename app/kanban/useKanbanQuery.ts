import { useQuery } from "@tanstack/vue-query";
import { DB } from "@/lib/appwrite";
import {
  COLLECTION_CUSTOMERS,
  COLLECTION_DEALS,
  DB_ID,
} from "~/constants/app.constants";
import { KANBAN_DATA } from "./kanban.data";
import type { IDeal } from "~/types/dealt.types";

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
      const newBoard = [...KANBAN_DATA];
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

          column.items.push({
            $createdAt: deal.$createdAt,
            id: deal.$id,
            name: deal.name,
            price: deal.price,
            companyName: customer?.name || "No company",
            status: column.name,
          });
        }
      }

      return newBoard;
    },
  });
}
